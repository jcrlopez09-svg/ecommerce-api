<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ProductController extends Controller
{
    #[OA\Get(
        path: '/api/products',
        summary: 'Listar productos',
        tags: ['Products'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Lista de productos'
            )
        ]
    )]
    public function index(): JsonResponse
    {
        $products = Product::where('active', true)->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    #[OA\Post(
        path: '/api/products',
        summary: 'Crear producto',
        tags: ['Products'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'price', 'stock'],
                properties: [
                    new OA\Property(
                        property: 'name',
                        type: 'string',
                        example: 'Laptop Lenovo'
                    ),
                    new OA\Property(
                        property: 'description',
                        type: 'string',
                        example: 'Laptop para uso profesional'
                    ),
                    new OA\Property(
                        property: 'price',
                        type: 'number',
                        format: 'float',
                        example: 799.99
                    ),
                    new OA\Property(
                        property: 'stock',
                        type: 'integer',
                        example: 10
                    ),
                    new OA\Property(
                        property: 'active',
                        type: 'boolean',
                        example: true
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Producto creado'
            ),
            new OA\Response(
                response: 422,
                description: 'Error de validación'
            )
        ]
    )]
    public function store(ProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Producto creado correctamente.',
            'data' => $product,
        ], 201);
    }

    #[OA\Get(
        path: '/api/products/{product}',
        summary: 'Mostrar producto',
        tags: ['Products'],
        parameters: [
            new OA\Parameter(
                name: 'product',
                in: 'path',
                required: true,
                description: 'ID del producto',
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Producto encontrado'
            ),
            new OA\Response(
                response: 404,
                description: 'Producto no encontrado'
            )
        ]
    )]
    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $product,
        ]);
    }

    #[OA\Put(
        path: '/api/products/{product}',
        summary: 'Actualizar producto',
        tags: ['Products'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'product',
                in: 'path',
                required: true,
                description: 'ID del producto',
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(
                        property: 'name',
                        type: 'string',
                        example: 'Laptop Lenovo actualizada'
                    ),
                    new OA\Property(
                        property: 'description',
                        type: 'string',
                        example: 'Nueva descripción'
                    ),
                    new OA\Property(
                        property: 'price',
                        type: 'number',
                        format: 'float',
                        example: 899.99
                    ),
                    new OA\Property(
                        property: 'stock',
                        type: 'integer',
                        example: 15
                    ),
                    new OA\Property(
                        property: 'active',
                        type: 'boolean',
                        example: true
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Producto actualizado'
            ),
            new OA\Response(
                response: 404,
                description: 'Producto no encontrado'
            ),
            new OA\Response(
                response: 422,
                description: 'Error de validación'
            )
        ]
    )]
    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado correctamente.',
            'data' => $product->fresh(),
        ]);
    }

    #[OA\Delete(
        path: '/api/products/{product}',
        summary: 'Eliminar producto',
        tags: ['Products'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(
                name: 'product',
                in: 'path',
                required: true,
                description: 'ID del producto',
                schema: new OA\Schema(type: 'integer'),
                example: 1
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Producto eliminado'
            ),
            new OA\Response(
                response: 404,
                description: 'Producto no encontrado'
            )
        ]
    )]
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado correctamente.',
        ]);
    }
}