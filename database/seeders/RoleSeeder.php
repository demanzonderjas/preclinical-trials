<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $role = Role::firstOrNew(['name' => 'admin']);
        $role->name = 'admin';
        $role->save();

        $user = User::where('email', 'daan@puzzel.org')->first();
        $user2 = User::where('email', 'julia.menon@heart-institute.nl')->first();
        $user->roles()->sync($role);
        $user2->roles()->sync($role);
    }
}
