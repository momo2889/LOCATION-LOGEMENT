<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Comptes de test : un par rôle, plus un compte cumulant locataire + propriétaire
 * (pour démontrer la bascule entre les deux espaces).
 *
 * Mot de passe commun : Password123!  (dev uniquement — voir README).
 */
class DemoUserSeeder extends Seeder
{
    private const PASSWORD = 'Password123!';

    public function run(): void
    {
        $roles = Role::pluck('id', 'name'); // ['tenant' => 1, 'owner' => 2, 'admin' => 3]

        // [name, email, phone, roles[], verification_status]
        $accounts = [
            ['Awa Diop (Locataire)',      'locataire@terangaloc.sn',     '+221770000001', [Role::TENANT], 'unverified'],
            ['Modou Fall (Propriétaire)', 'proprietaire@terangaloc.sn',  '+221770000002', [Role::OWNER],  'verified'],
            ['Admin TerangaLoc',          'admin@terangaloc.sn',         '+221770000003', [Role::ADMIN],  'verified'],
            ['Fatou Sow (Mixte)',         'mixte@terangaloc.sn',         '+221770000004', [Role::TENANT, Role::OWNER], 'verified'],
        ];

        foreach ($accounts as [$name, $email, $phone, $roleNames, $status]) {
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'phone' => $phone,
                    'password' => Hash::make(self::PASSWORD),
                    'email_verified_at' => now(),
                    'verification_status' => $status,
                    'verified_at' => $status === 'verified' ? now() : null,
                    'locale' => 'fr',
                    'is_active' => true,
                ],
            );

            $roleIds = collect($roleNames)->map(fn ($n) => $roles[$n])->all();
            $user->roles()->sync($roleIds);
        }
    }
}
