<?php

namespace Tests\Feature\Characterization;

use App\Models\AdminAction;
use App\Models\EmbargoEndDate;
use App\Models\Protocol;
use App\Models\Role;
use App\Models\User;

/**
 * Helpers to build users and protocols for the characterization tests.
 *
 * These tests pin down how the platform behaves before the Laravel 13 port,
 * so the same assertions can be run against the new backend.
 */
trait BuildsPctData
{
	protected function makeUser(array $attributes = []): User
	{
		return User::factory()->create($attributes);
	}

	protected function makeAdmin(): User
	{
		$admin = $this->makeUser();
		$role = Role::where('name', 'admin')->first();
		if (!$role) {
			$role = new Role();
			$role->name = 'admin';
			$role->save();
		}
		$admin->roles()->attach($role->id);

		return $admin->fresh();
	}

	protected function protocolDetails(array $overrides = []): array
	{
		return array_merge([
			'title' => 'Dapagliflozin and cardiac remodelling after ischemia-reperfusion in mice',
			'start_date' => '2027-01-01',
			'end_date' => '2027-06-30',
			'study_status' => 'not_started',
			'species' => 'mouse',
			'hypothesis' => 'Dapagliflozin limits adverse remodelling.',
			'has_embargo' => 'no',
			'contact_name' => 'Sanne de Vries',
			'contact_role' => 'Postdoc',
			'contact_email' => 'sanne@example.test',
			'study_centre' => [['name' => 'UMC Utrecht', 'city' => 'Utrecht', 'country' => 'NL']],
		], $overrides);
	}

	protected function makeProtocol(User $owner, string $status = 'draft', array $details = []): Protocol
	{
		$protocol = new Protocol();
		$protocol->status = $status;
		$owner->protocols()->save($protocol);
		$protocol->addDetailsToDatabase($this->protocolDetails($details));

		return $protocol->fresh(['details']);
	}

	/**
	 * A published protocol, approved by an admin, optionally under embargo.
	 */
	protected function makePublishedProtocol(User $owner, bool $embargo = false, ?string $embargoEndDate = null): Protocol
	{
		$protocol = $this->makeProtocol($owner, 'published', ['has_embargo' => $embargo ? 'yes' : 'no']);

		$approval = new AdminAction();
		$approval->protocol_id = $protocol->id;
		$approval->action = 'approve';
		$approval->message = '';
		$approval->save();

		if ($embargo) {
			$protocol->embargoEndDates()->save(new EmbargoEndDate([
				'date' => $embargoEndDate ?? now()->addYear()->toDateString(),
			]));
		}

		return $protocol->fresh(['details', 'adminActions', 'embargoEndDates']);
	}

	protected function detailValue(Protocol $protocol, string $key)
	{
		$detail = $protocol->fresh(['details'])->details->firstWhere('key', $key);

		return $detail ? $detail->value : null;
	}
}
