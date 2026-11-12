<?php

namespace App\Services;

use Stripe\PaymentIntent;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeService
{
    public function __construct()
    {
        $secret = config('services.stripe.secret');
        if ($secret) {
            Stripe::setApiKey($secret);
        }
    }

    public function createPaymentIntent(int $amountInCents, string $currency, array $metadata = [], ?string $idempotencyKey = null): PaymentIntent
    {
        if (!config('services.stripe.secret')) {
            throw new \RuntimeException('La clave secreta de Stripe no está configurada.');
        }

        $params = [
            'amount' => $amountInCents,
            'currency' => strtolower($currency),
            'automatic_payment_methods' => ['enabled' => true],
            'metadata' => $metadata,
        ];

        $options = $idempotencyKey ? ['idempotency_key' => $idempotencyKey] : [];
        return PaymentIntent::create($params, $options);
    }

    public function constructWebhookEvent(string $payload, string $signature): \Stripe\Event
    {
        $secret = config('services.stripe.webhook_secret');
        if (!$secret) {
            throw new \RuntimeException('El secreto del webhook de Stripe no está configurado.');
        }
        return Webhook::constructEvent($payload, $signature, $secret);
    }
}
