<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\AdminAction;
use App\Models\Ambassador;
use App\Models\Channel;
use App\Models\EmbargoEndDate;
use App\Models\EmbargoExtension;
use App\Models\FeedbackPoint;
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
		// F1: returned with four points, three of them addressed since.
		$round = $rejected->reviewRounds()->create([
			'number' => 1,
			'submitted_at' => Carbon::now()->subDays(20),
			'decision' => 'returned',
			'decided_at' => Carbon::now()->subDays(14),
			'decided_by' => $admin->id,
			'message' => 'Please add the sample size calculation.',
			// What the reviewer saw; the researcher has changed the title and the sample size since.
			'snapshot' => array_merge($rejected->fresh('details')->values(), [
				'title' => 'E2E Rejected: dapagliflozin after ischemia-reperfusion',
				'sample_size_calculation' => 'no',
			]),
		]);
		$points = [];
		foreach ([
			['title', 'Please mention the species and model in the title.', FeedbackPoint::ADDRESSED],
			['sample_size_calculation', 'Please add the sample size calculation, or explain why it was not performed.', FeedbackPoint::ADDRESSED],
			['study_arms', 'Group sizes do not add up to the sum of animals.', FeedbackPoint::ADDRESSED],
			['investigators_blinded_assessment', 'Please clarify how the outcome assessors are blinded to group allocation.', FeedbackPoint::OPEN],
		] as [$key, $body, $status]) {
			$points[$key] = $round->points()->create(['protocol_id' => $rejected->id, 'field_key' => $key, 'body' => $body, 'status' => $status, 'created_by' => $admin->id, 'addressed_at' => $status === FeedbackPoint::ADDRESSED ? Carbon::now()->subDays(10) : null]);
		}
		$comments = Channel::create(['kind' => Channel::TEAM, 'protocol_id' => $rejected->id, 'protocol_owner_id' => $researcher->id]);
		$this->message($comments, $admin, 'Please add the sample size calculation.', 14 * 24);
		$comments->readers()->attach($researcher->id, ['last_read_at' => Carbon::now()->subDays(13)]);
		$this->activity($rejected, 'submitted', [], $researcher, 20);
		$this->activity($rejected, 'returned', ['points' => 4], $admin, 14);
		$this->activity($rejected, 'addressed', ['fields' => ['title', 'sample_size_calculation', 'study_arms']], $researcher, 10);

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
		$this->message($channel, $colleague, 'Which primary outcome did you register?', 50);
		$this->message($channel, $researcher, 'Time to return of spontaneous circulation.', 49);
		$channel->readers()->attach($researcher->id, ['last_read_at' => Carbon::now()->subHours(49)]);
		$this->message($channel, $colleague, 'Thanks! Could we contact you again once the study is published?', 2); // unread

		// F2: the PCT team, and a thread on a feedback point.
		$team = Channel::create(['kind' => Channel::TEAM, 'subject' => 'Welcome to preclinicaltrials.eu', 'protocol_owner_id' => $researcher->id]);
		$this->message($team, $admin, 'Happy to help you import your APAFiS file or answer questions about the form.', 24 * 60);
		$team->readers()->attach($researcher->id, ['last_read_at' => Carbon::now()->subDays(59)]);

		$thread = Channel::create(['kind' => Channel::FEEDBACK, 'protocol_id' => $rejected->id, 'feedback_point_id' => $points['investigators_blinded_assessment']->id, 'protocol_owner_id' => $researcher->id]);
		$this->message($thread, $researcher, 'Our echo analysis is done by a technician in another lab. Does that count as blinded assessment?', 30);
		$this->message($thread, $admin, 'Yes, if they do not know the group allocation. Please describe that set-up in the field.', 20); // unread
		$thread->readers()->attach($researcher->id, ['last_read_at' => Carbon::now()->subHours(30)]);

		$this->activity($published, 'published', ['pct_id' => $published->pct_id], $admin, 200);
		$this->activity($published, 'amended', ['fields' => ['study_status']], $researcher, 120);
		$this->activity($embargoed, 'published', ['pct_id' => $embargoed->pct_id], $admin, 200);

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

		// The ambassadors as listed on the public site.
		foreach ([
			['Prof. Georg Schmölzer', 'Associate Professor, University of Alberta', 'Edmonton, Canada', 53.546, -113.494],
			['Prof. Netzahualpilli Delgado Figueroa', 'Physician, professor of evidence-based medicine', 'Guadalajara, Mexico', 20.660, -103.350],
			['Prof. Roberto Bolli', 'Professor of Medicine, Physiology and Biophysics', 'Louisville, United States', 38.253, -85.759],
			['Dr. Marc Avey & Prof. Manoj Lalu', 'Standards director · Assistant professor of anesthesiology', 'Ottawa, Canada', 45.421, -75.697],
			['Dr. Emily Sena', 'Senior lecturer in stroke research, University of Edinburgh', 'Edinburgh, United Kingdom', 55.953, -3.188],
			['Dr. Lilas Courtot & Emeline Gougeon', 'Scientific advisor and administrator, Comité Scientifique Pro Anima', 'Paris, France', 48.857, 2.352],
			['Dr. Viola Galligioni', 'Researcher, Netherlands Institute for Neuroscience (KNAW)', 'Amsterdam, Netherlands', 52.368, 4.904],
			['Aina Cevera i Barea', 'PhD student, experimental cardiology & regenerative medicine', 'Utrecht, Netherlands', 52.091, 5.122],
			['Prof. Matteo Bruschettini', 'Associate professor of paediatrics, director of Cochrane Sweden', 'Lund, Sweden', 55.705, 13.191],
			['Dr. Ilya Sukhanov', 'PI, Institute of Pharmacology, Pavlov First St Petersburg State Medical University', 'Saint Petersburg, Russia', 59.931, 30.360],
			['Mina Ibrahim Shalapy', 'R&D manager, El Romany Ophthalmics · Ain Shams University', 'Cairo, Egypt', 30.044, 31.236],
			['Fahrul Nurkolis', 'Vice President, Medical Research Center of Indonesia', 'Surabaya, Indonesia', -7.257, 112.752],
		] as [$name, $description, $place, $lat, $lng]) {
			$ambassador = new Ambassador();
			$ambassador->name = $name;
			$ambassador->description = $description;
			$ambassador->geo_search = $place;
			$ambassador->latitude = (string) $lat;
			$ambassador->longitude = (string) $lng;
			$ambassador->save();
		}
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

	private function message(Channel $channel, User $author, string $text, int $hoursAgo): void
	{
		$message = new Message(['user_id' => $author->id, 'text' => $text]);
		$message->created_at = $message->updated_at = Carbon::now()->subHours($hoursAgo);
		$channel->messages()->save($message);
	}

	private function activity(Protocol $protocol, string $type, array $data, User $actor, int $daysAgo): void
	{
		$log = ActivityLog::record($protocol, $type, $data, $actor);
		$log->created_at = Carbon::now()->subDays($daysAgo);
		$log->save();
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
