<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EcommerceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register_and_receive_a_token(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Cliente de Prueba',
            'email' => 'cliente@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email'], 'token']]);
    }

    public function test_public_catalog_only_lists_active_products(): void
    {
        Product::create(['name' => 'Activo', 'price' => 10, 'stock' => 5, 'active' => true]);
        Product::create(['name' => 'Inactivo', 'price' => 20, 'stock' => 2, 'active' => false]);

        $this->getJson('/api/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Activo');
    }

    public function test_guest_cannot_create_products_or_orders(): void
    {
        $this->postJson('/api/products', [
            'name' => 'Producto', 'price' => 10, 'stock' => 1,
        ])->assertUnauthorized();

        $this->postJson('/api/orders', [
            'items' => [['product_id' => 1, 'quantity' => 1]],
        ])->assertUnauthorized();
    }

    public function test_authenticated_customer_can_create_order_and_stock_is_reduced(): void
    {
        $user = User::factory()->create();
        $product = Product::create(['name' => 'Mouse', 'price' => 15.50, 'stock' => 5, 'active' => true]);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/orders', ['items' => [['product_id' => $product->id, 'quantity' => 2]]])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.total', '31.00');

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock' => 3]);
        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'total' => 31.00]);
    }

    public function test_customer_cannot_read_another_customers_order(): void
    {
        $owner = User::factory()->create();
        $otherCustomer = User::factory()->create();
        $order = Order::create(['user_id' => $owner->id, 'total' => 20, 'status' => 'pending']);

        $this->actingAs($otherCustomer, 'sanctum')
            ->getJson('/api/orders/'.$order->id)
            ->assertForbidden()
            ->assertJsonPath('success', false);
    }
}
