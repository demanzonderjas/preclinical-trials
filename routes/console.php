<?php

use Illuminate\Support\Facades\Schedule;

// Embargo reminders (one month and two weeks ahead) and the automatic lift.
Schedule::command('embargo:check')->daily();

// Reminders to update the study status after the expected end date.
Schedule::command('enddate:reminder')->daily();
