<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Vérifie que le RBAC est bien imposé CÔTÉ SERVEUR : un propriétaire ne doit
 * jamais atteindre une route réservée à l'admin, même avec un token valide.
 */
class RbacTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function userWithRole(string $roleName): User
    {
        $user = User::factory()->create();
        $roleId = Role::where('name', $roleName)->value('id');
        $user->roles()->sync([$roleId]);

        return $user;
    }

    public function test_owner_cannot_access_admin_route(): void
    {
        $owner = $this->userWithRole(Role::OWNER);

        $this->actingAs($owner, 'sanctum')
            ->getJson('/api/v1/admin/ping')
            ->assertStatus(403)
            ->assertJsonPath('code', 'FORBIDDEN');
    }

    public function test_admin_can_access_admin_route(): void
    {
        $admin = $this->userWithRole(Role::ADMIN);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/ping')
            ->assertOk()
            ->assertJsonPath('data', 'pong admin');
    }

    public function test_guest_cannot_access_admin_route(): void
    {
        $this->getJson('/api/v1/admin/ping')->assertStatus(401);
    }

    public function test_tenant_can_enable_owner_space(): void
    {
        $tenant = $this->userWithRole(Role::TENANT);

        $this->actingAs($tenant, 'sanctum')
            ->postJson('/api/v1/profile/enable-owner')
            ->assertOk();

        $this->assertTrue($tenant->fresh()->hasRole(Role::OWNER));
    }
}
