<?php

namespace Database\Seeders;

use App\Models\AdminAction;
use App\Models\Ambassador;
use App\Models\Channel;
use App\Models\EmbargoEndDate;
use App\Models\EmbargoExtension;
use App\Models\Message;
use App\Models\NewsItem;
use App\Models\Protocol;
use App\Models\Revision;
use App\Models\Role;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Deterministic data for the end-to-end suite (tests/e2e).
 *
 * Every persona and protocol here is referenced by name from tests/e2e/support/fixtures.ts,
 * so change both together. All accounts share the password below; it only exists in this
 * test database.
 */
class E2ESeeder extends Seeder
{
	public const PASSWORD = 'pct-e2e-Password1';

	public function run()
	{
		$this->call(FaqCategorySeeder::class);
		$this->call(FaqItemSeeder::class);
		$this->call(PageSeeder::class);

		$admin = $this->user('admin@pct.test', 'Julia', 'Menon', 'UMC Utrecht', 'Scientific Daily Director');
		$adminRole = new Role();
		$adminRole->name = 'admin';
		$adminRole->save();
		$admin->roles()->attach($adminRole->id);

		$researcher = $this->user('researcher@pct.test', 'Sanne', 'de Vries', 'UMC Utrecht', 'Postdoc');
		$colleague = $this->user('colleague@pct.test', 'Emily', 'Sena', 'University of Edinburgh', 'Senior lecturer', 'GB', 'Edinburgh');
		$this->user('unverified@pct.test', 'Wei', 'Zhang', 'Fudan University', 'PhD student', 'CN', 'Shanghai', false);

		$this->protocol($researcher, 'draft', 'E2E Draft: early mobilisation after myocardial infarction in pigs', ['species' => 'pig']);
		$this->protocol($researcher, 'submitted_for_publication', 'E2E Submitted: microbiome transfer after stroke in aged rats', ['species' => 'rat']);

		$rejected = $this->protocol($researcher, 'rejected', 'E2E Rejected: dapagliflozin after ischemia-reperfusion in mice');
		$this->adminAction($rejected, 'reject', 'Please add the sample size calculation.');

		$published = $this->protocol($researcher, 'published', 'E2E Published: sodium bicarbonate in asphyxiated newborn piglets', [
			'species' => 'pig',
			'study_status' => 'active',
		]);
		$this->adminAction($published, 'approve');
		$published->revisions()->save(new Revision([
			'changes' => [['key' => 'study_status', 'old_value' => 'not_started', 'new_value' => 'active']],
			'admin_only' => false,
		]));

		$embargoed = $this->protocol($researcher, 'published', 'E2E Embargoed: cardiomyocyte patch in chronic MI pigs', [
			'species' => 'pig',
			'has_embargo' => 'yes',
		]);
		$this->adminAction($embargoed, 'approve');
		$embargoed->embargoEndDates()->save(new EmbargoEndDate(['date' => Carbon::now()->addDays(165)->toDateString()]));

		$requested = $this->protocol($researcher, 'published', 'E2E Extension requested: senolytics and graft survival in aged rats', [
			'species' => 'rat',
			'has_embargo' => 'yes',
		]);
		$this->adminAction($requested, 'approve');
		$requested->embargoEndDates()->save(new EmbargoEndDate(['date' => Carbon::now()->addDays(20)->toDateString()]));
		$requested->embargoExtensions()->save(new EmbargoExtension(['reason' => 'The confirmatory cohort finishes in spring.']));

		$colleagues = $this->protocol($colleague, 'published', 'E2E Colleague: hydrogel-delivered BMP-2 for bone defects in sheep', [
			'species' => 'sheep',
			'contact_name' => 'Emily Sena',
			'contact_email' => 'colleague@pct.test',
		]);
		$this->adminAction($colleagues, 'approve');

		$channel = Channel::create([
			'protocol_id' => $published->id,
			'protocol_owner_id' => $researcher->id,
			'questioner_id' => $colleague->id,
		]);
		$channel->messages()->save(new Message(['user_id' => $colleague->id, 'text' => 'Which primary outcome did you register?']));
		$channel->messages()->save(new Message(['user_id' => $researcher->id, 'text' => 'Time to return of spontaneous circulation.']));

		foreach ([
			['E2E News: presentation at EUSAAT', 'published', '2024-09-20'],
			['E2E News: webinar with the French 3R Center', 'published', '2024-03-07'],
			['E2E News: unpublished draft item', 'draft', '2026-09-30'],
		] as [$title, $status, $date]) {
			$news = new NewsItem();
			$news->title = $title;
			$news->status = $status;
			$news->summary = "Summary of $title.";
			$news->content = "<p>Content of $title.</p>";
			$news->publish_date = $date;
			$news->created_at = $date;
			$news->updated_at = $date;
			$news->save();
		}

		$ambassador = new Ambassador();
		$ambassador->name = 'Prof. Georg Schmölzer';
		$ambassador->description = 'Associate Professor, University of Alberta';
		$ambassador->geo_search = 'Edmonton, Canada';
		$ambassador->latitude = '53.546';
		$ambassador->longitude = '-113.494';
		$ambassador->save();
	}

	private function user(string $email, string $first, string $last, string $institution, string $role, string $country = 'NL', string $city = 'Utrecht', bool $verified = true): User
	{
		$user = new User();
		$user->first_name = $first;
		$user->last_name = $last;
		$user->email = $email;
		$user->institution = $institution;
		$user->role = $role;
		$user->country = $country;
		$user->city = $city;
		$user->password = Hash::make(self::PASSWORD);
		$user->email_verified_at = $verified ? Carbon::now()->subYear() : null;
		$user->save();

		return $user;
	}

	private function protocol(User $owner, string $status, string $title, array $overrides = []): Protocol
	{
		$protocol = new Protocol();
		$protocol->status = $status;
		$owner->protocols()->save($protocol);
		$protocol->addDetailsToDatabase(array_merge($this->completeDetails($owner, $title), $overrides));

		return $protocol;
	}

	private function adminAction(Protocol $protocol, string $action, string $message = ''): void
	{
		$adminAction = new AdminAction();
		$adminAction->protocol_id = $protocol->id;
		$adminAction->action = $action;
		$adminAction->message = $message;
		$adminAction->save();
	}

	/**
	 * Every required answer of the protocol form, so seeded protocols can be submitted as-is.
	 */
	private function completeDetails(User $owner, string $title): array
	{
		return [
			'title' => $title,
			'short_title' => substr($title, 5, 40),
			'financial_support' => ['grants'],
			'funder' => 'Dutch Heart Foundation',
			'start_date' => '2027-01-01',
			'end_date' => '2027-12-31',
			'study_status' => 'not_started',
			'research_field' => 'Cardiology',
			'hypothesis' => 'The intervention improves left ventricular function compared with control.',
			'intervention_type' => 'compound',
			'placebo_controlled' => 'yes',
			'study_stage' => 'study_stage_2_value',
			'primary_readout_parameter' => 'Left ventricular ejection fraction at 4 weeks',
			'secondary_readout_parameter' => 'Infarct size',
			'experimental_design' => 'Animals are randomised to intervention or control after surgery.',
			'exclusive_animal_use' => 'yes',
			'species' => 'mouse',
			'strain' => 'C57BL/6J',
			'sex' => 'both',
			'sample_size_calculation' => 'yes',
			'sample_size_calculation_details' => 'Power 0.8, alpha 0.05, effect size 1.1.',
			'sum_of_animals' => '36',
			'study_arms' => [
				['type' => 'sham', 'number' => 6, 'intervention' => 'Sham procedure'],
				['type' => 'control', 'number' => 15, 'intervention' => 'Vehicle'],
				['type' => 'intervention', 'number' => 15, 'intervention' => 'Treatment'],
			],
			'randomisation' => 'yes',
			'randomisation_method_used' => 'computer_generated_random_number_sequence',
			'details_randomisation' => 'block_randomisation',
			'investigators_blinded_intervention' => 'yes',
			'yes_blinded_intervention_how_details' => 'Coded syringes prepared by a colleague.',
			'investigators_blinded_assessment' => 'yes',
			'yes_blinded_assessment_how_details' => 'Images are analysed by a blinded technician.',
			'original_animal_ethics_committee_application' => 'yes',
			'application_number' => 'AVD-2026-0001',
			'has_embargo' => 'no',
			'contact_name' => $owner->first_name . ' ' . $owner->last_name,
			'contact_role' => $owner->role,
			'contact_email' => $owner->email,
			'study_centre' => [['name' => $owner->institution, 'city' => $owner->city, 'country' => $owner->country]],
			'statement_of_accuracy' => true,
		];
	}
}
