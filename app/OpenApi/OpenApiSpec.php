<?php

namespace App\OpenApi;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'E-Commerce API',
    description: 'API RESTful para una aplicación de comercio electrónico desarrollada con Laravel 12.'
)]
#[OA\Server(
    url: 'http://localhost:8000',
    description: 'Servidor local'
)]
class OpenApiSpec
{
}