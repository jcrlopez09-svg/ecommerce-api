<?php

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Las rutas protegidas de API usan auth:sanctum.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(function (Request $request, Throwable $exception): bool {
            return $request->is('api/*') || $request->expectsJson();
        });

        $exceptions->render(function (ValidationException $exception, Request $request) {
            if (!$request->is('api/*')) return null;
            return response()->json([
                'success' => false,
                'message' => 'Los datos enviados no son válidos.',
                'errors' => $exception->errors(),
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if (!$request->is('api/*')) return null;
            return response()->json(['success' => false, 'message' => 'No estás autenticado.'], 401);
        });

        $exceptions->render(function (AuthorizationException $exception, Request $request) {
            if (!$request->is('api/*')) return null;
            return response()->json(['success' => false, 'message' => 'No tienes permiso para realizar esta operación.'], 403);
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) {
            if (!$request->is('api/*')) return null;
            return response()->json(['success' => false, 'message' => 'El recurso solicitado no existe.'], 404);
        });

        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            if (!$request->is('api/*')) return null;
            $message = $exception->getMessage() ?: match ($exception->getStatusCode()) {
                403 => 'No tienes permiso para realizar esta operación.',
                404 => 'El recurso solicitado no existe.',
                422 => 'La solicitud no pudo procesarse.',
                default => 'La solicitud no pudo completarse.',
            };
            return response()->json(['success' => false, 'message' => $message], $exception->getStatusCode());
        });

        $exceptions->render(function (Throwable $exception, Request $request) {
            if (!$request->is('api/*')) return null;
            Log::error('Error no controlado en la API.', ['exception' => $exception]);
            return response()->json(['success' => false, 'message' => 'Ocurrió un error interno al procesar la solicitud.'], 500);
        });
    })->create();
