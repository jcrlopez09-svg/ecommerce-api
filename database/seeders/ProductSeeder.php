<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::create([
            'name' => 'Laptop Lenovo',
            'description' => 'Laptop Lenovo para trabajo y estudio.',
            'price' => 799.99,
            'stock' => 10,
            'active' => true,
        ]);

        Product::create([
            'name' => 'Mouse Logitech',
            'description' => 'Mouse inalámbrico Logitech.',
            'price' => 29.99,
            'stock' => 50,
            'active' => true,
        ]);

        Product::create([
            'name' => 'Teclado Mecánico',
            'description' => 'Teclado mecánico RGB.',
            'price' => 89.99,
            'stock' => 25,
            'active' => true,
        ]);

        Product::create([
            'name' => 'Monitor 24 pulgadas',
            'description' => 'Monitor Full HD de 24 pulgadas.',
            'price' => 179.99,
            'stock' => 15,
            'active' => true,
        ]);

        Product::create([
            'name' => 'Auriculares Bluetooth',
            'description' => 'Auriculares inalámbricos Bluetooth.',
            'price' => 59.99,
            'stock' => 30,
            'active' => true,
        ]);

        Product::create([
            'name' => 'Webcam HD',
            'description' => 'Webcam HD para videollamadas.',
            'price' => 49.99,
            'stock' => 20,
            'active' => true,
        ]);
    }
}