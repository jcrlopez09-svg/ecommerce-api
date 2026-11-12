<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\OrderRequest;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class OrderController extends Controller
{
    #[OA\Post(
        path: '/api/orders',
        summary: 'Crear una orden',
        tags: ['Orders'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['items'],
                properties: [
                    new OA\Property(
                        property: 'items',
                        type: 'array',
                        minItems: 1,
                        items: new OA\Items(
                            properties: [
                                new OA\Property(
                                    property: 'product_id',
                                    type: 'integer',
                                    example: 1
                                ),
                                new OA\Property(
                                    property: 'quantity',
                                    type: 'integer',
                                    example: 2
                                ),
                            ],
                            type: 'object'
                        )
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Orden creada correctamente'
            ),
            new OA\Response(
                response: 422,
                description: 'Stock insuficiente o datos inválidos'
            ),
            new OA\Response(
                response: 401,
                description: 'No autenticado'
            )
        ]
    )]
    public function store(OrderRequest $request): JsonResponse
    {
        $order = DB::transaction(function () use ($request) {
            $total = 0;

            $order = Order::create([
                'user_id' => $request->user()->id,
                'total' => 0,
                'status' => 'pending',
            ]);

            foreach ($request->items as $item) {
                $product = Product::where('id', $item['product_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$product || !$product->active) {
                    abort(422, 'El producto no está disponible.');
                }

                if ($product->stock < $item['quantity']) {
                    abort(
                        422,
                        "Stock insuficiente para el producto: {$product->name}."
                    );
                }

                $price = (float) $product->price;
                $quantity = (int) $item['quantity'];
                $subtotal = $price * $quantity;

                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'price' => $price,
                    'subtotal' => $subtotal,
                ]);

                $product->decrement('stock', $quantity);

                $total += $subtotal;
            }

            $order->update([
                'total' => $total,
            ]);

            return $order;
        });

        $order->load('items.product');

        return response()->json([
            'success' => true,
            'message' => 'Orden creada correctamente.',
            'data' => $order,
        ], 201);
    }

    #[OA\Get(
        path: '/api/orders',
        summary: 'Obtener historial de órdenes',
        tags: ['Orders'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de órdenes del usuario autenticado'
            ),
            new OA\Response(
                response: 401,
                description: 'No autenticado'
            )
        ]
    )]
    public function index(): JsonResponse
    {
        $orders = Order::where('user_id', request()->user()->id)
            ->with('items.product')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    #[OA\Get(
        path: '/api/orders/{order}',
        summary: 'Mostrar una orden',
        tags: ['Orders'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'order',
                in: 'path',
                required: true,
                description: 'ID de la orden',
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Detalle de la orden'
            ),
            new OA\Response(
                response: 403,
                description: 'La orden no pertenece al usuario autenticado'
            ),
            new OA\Response(
                response: 404,
                description: 'Orden no encontrada'
            )
        ]
    )]
    public function show(Order $order): JsonResponse
    {
        if ($order->user_id !== request()->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'No tienes permiso para consultar esta orden.',
            ], 403);
        }

        $order->load([
            'items.product',
            'payments',
        ]);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }
}