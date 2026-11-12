<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\StripeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;
use OpenApi\Attributes as OA;

class PaymentController extends Controller
{
    #[OA\Post(
        path: '/api/orders/{order}/payment',
        summary: 'Iniciar el pago de una orden propia mediante Stripe',
        tags: ['Payments'],
        security: [['sanctum' => []]],
        parameters: [new OA\Parameter(name: 'order', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))],
        responses: [
            new OA\Response(response: 200, description: 'Intento de pago creado o ya existente'),
            new OA\Response(response: 403, description: 'La orden no pertenece al usuario'),
            new OA\Response(response: 409, description: 'La orden ya fue pagada'),
            new OA\Response(response: 502, description: 'Stripe no pudo procesar la solicitud')
        ]
    )]
    public function store(Request $request, Order $order, StripeService $stripe): JsonResponse
    {
        if ((int) $order->user_id !== (int) $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para pagar esta orden.'], 403);
        }

        if ($order->status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Esta orden ya fue pagada.'], 409);
        }

        if ((float) $order->total <= 0) {
            return response()->json(['success' => false, 'message' => 'El total de la orden debe ser mayor que cero.'], 422);
        }

        $existing = $order->payments()->where('status', 'pending')->latest()->first();
        if ($existing && $existing->transaction_id) {
            try {
                $intent = \Stripe\PaymentIntent::retrieve($existing->transaction_id);
                return response()->json([
                    'success' => true,
                    'message' => 'Ya existe un intento de pago pendiente para esta orden.',
                    'data' => ['payment' => $existing, 'client_secret' => $intent->client_secret],
                ]);
            } catch (Throwable $e) {
                Log::warning('No se pudo recuperar el PaymentIntent existente.', ['payment_id' => $existing->id, 'error' => $e->getMessage()]);
            }
        }

        $payment = Payment::create([
            'order_id' => $order->id,
            'provider' => 'stripe',
            'amount' => $order->total,
            'currency' => config('services.stripe.currency', 'usd'),
            'status' => 'pending',
        ]);

        try {
            $intent = $stripe->createPaymentIntent(
                (int) round(((float) $order->total) * 100),
                config('services.stripe.currency', 'usd'),
                ['order_id' => (string) $order->id, 'payment_id' => (string) $payment->id],
                'order-'.$order->id.'-payment-'.$payment->id
            );

            $payment->update(['transaction_id' => $intent->id]);

            return response()->json([
                'success' => true,
                'message' => 'Intento de pago creado. Confirma el pago desde el cliente con Stripe.js.',
                'data' => [
                    'payment' => $payment->fresh(),
                    'client_secret' => $intent->client_secret,
                ],
            ]);
        } catch (Throwable $e) {
            $payment->update(['status' => 'failed']);
            Log::error('Error al crear PaymentIntent de Stripe.', ['order_id' => $order->id, 'error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'No fue posible iniciar el pago con Stripe. Verifica la configuración e inténtalo nuevamente.'], 502);
        }
    }

    #[OA\Post(
        path: '/api/stripe/webhook',
        summary: 'Webhook de Stripe para confirmar el resultado de pagos',
        tags: ['Payments'],
        responses: [new OA\Response(response: 200, description: 'Evento procesado'), new OA\Response(response: 400, description: 'Firma o evento inválido')]
    )]
    public function webhook(Request $request, StripeService $stripe): JsonResponse
    {
        try {
            $event = $stripe->constructWebhookEvent($request->getContent(), (string) $request->header('Stripe-Signature'));
        } catch (Throwable $e) {
            Log::warning('Webhook Stripe rechazado.', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Firma de webhook inválida o configuración incompleta.'], 400);
        }

        $intent = $event->data->object;
        if (in_array($event->type, ['payment_intent.succeeded', 'payment_intent.payment_failed'], true)) {
            $payment = Payment::where('transaction_id', $intent->id)->first();
            if ($payment) {
                if ($event->type === 'payment_intent.succeeded') {
                    $expectedAmount = (int) round(((float) $payment->amount) * 100);
                    $receivedAmount = (int) ($intent->amount_received ?? $intent->amount ?? 0);
                    $expectedCurrency = strtolower($payment->currency);
                    $receivedCurrency = strtolower((string) ($intent->currency ?? ''));
                    if ($receivedAmount !== $expectedAmount || $receivedCurrency !== $expectedCurrency) {
                        Log::error('Stripe webhook recibido con importe o moneda inesperados.', ['payment_id' => $payment->id, 'expected_amount' => $expectedAmount, 'received_amount' => $receivedAmount, 'expected_currency' => $expectedCurrency, 'received_currency' => $receivedCurrency]);
                        return response()->json(['success' => false, 'message' => 'El importe o la moneda del pago no coinciden con la orden.'], 400);
                    }
                    $payment->update(['status' => 'succeeded']);
                    $payment->order()->update(['status' => 'paid']);
                } else {
                    $payment->update(['status' => 'failed']);
                }
            }
        }

        return response()->json(['success' => true, 'message' => 'Evento de Stripe recibido.']);
    }
}
