<?php

namespace App\Http\Controllers\Api;

use App\Support\AdminMail;
use App\Http\Controllers\Controller;
use App\Mail\ContactFormSubmitted;
use App\Models\ContactForm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactFormController extends Controller
{
	public function store(Request $request)
	{
		$form = new ContactForm();
		$form->name = $request->name;
		$form->email = $request->email;
		$form->message = $request->message;
		$form->save();

		AdminMail::send(new ContactFormSubmitted($form));

		return response()->json(["success" => true]);
	}
}
