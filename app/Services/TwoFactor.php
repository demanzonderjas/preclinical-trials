<?php

namespace App\Services;

use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\Cache;

/**
 * Two-factor authentication for the admin area: time-based codes from an authenticator app
 * (RFC 6238: SHA-1, 6 digits, 30 second steps). Each admin has their own secret; the session
 * remembers which user passed (EnsureAdminTwoFactor). A lost phone is reset with pct:reset-two-factor.
 */
class TwoFactor
{
    public const SESSION_KEY = 'admin_two_factor_user';

    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    private const STEP = 30;

    /** Codes from one step before or after are accepted too, for clocks that drift a little. */
    private const WINDOW = 1;

    public function __construct(private User $user) {}

    public static function for(User $user): self
    {
        return new self($user);
    }

    public function enabled(): bool
    {
        return $this->user->two_factor_confirmed_at !== null && filled($this->user->two_factor_secret);
    }

    /** The secret being set up: kept across page loads so a scanned QR code stays valid. */
    public function pendingSecret(): string
    {
        if (! $this->user->two_factor_secret || $this->enabled()) {
            $this->user->forceFill(['two_factor_secret' => self::generateSecret(), 'two_factor_confirmed_at' => null])->save();
        }

        return $this->user->two_factor_secret;
    }

    /** Confirms the setup with a first code from the app. */
    public function confirm(string $code): bool
    {
        if ($this->enabled() || ! $this->user->two_factor_secret || ! $this->verifyCode($code)) {
            return false;
        }

        $this->user->forceFill(['two_factor_confirmed_at' => now()])->save();

        return true;
    }

    public function verify(string $code): bool
    {
        return $this->enabled() && $this->verifyCode($code);
    }

    public function disable(): void
    {
        $this->user->forceFill(['two_factor_secret' => null, 'two_factor_confirmed_at' => null])->save();
    }

    public function qrCodeSvg(): string
    {
        $label = rawurlencode(config('app.name').':'.$this->user->email);
        $url = "otpauth://totp/{$label}?".http_build_query(['secret' => $this->pendingSecret(), 'issuer' => config('app.name'), 'algorithm' => 'SHA1', 'digits' => 6, 'period' => self::STEP]);

        return (new Writer(new ImageRenderer(new RendererStyle(208, 0), new SvgImageBackEnd)))->writeString($url);
    }

    /** The code for a time step; public for tests. */
    public static function codeAt(string $secret, int $step): string
    {
        $hash = hash_hmac('sha1', pack('J', $step), self::base32Decode($secret), true);
        $offset = ord($hash[19]) & 0x0F;
        $number = ((ord($hash[$offset]) & 0x7F) << 24) | (ord($hash[$offset + 1]) << 16) | (ord($hash[$offset + 2]) << 8) | ord($hash[$offset + 3]);

        return str_pad((string) ($number % 1_000_000), 6, '0', STR_PAD_LEFT);
    }

    public static function currentStep(): int
    {
        return intdiv(now()->getTimestamp(), self::STEP);
    }

    private function verifyCode(string $code): bool
    {
        $code = preg_replace('/\s+/', '', $code);
        if (! preg_match('/^\d{6}$/', $code)) {
            return false;
        }

        $now = self::currentStep();
        for ($step = $now - self::WINDOW; $step <= $now + self::WINDOW; $step++) {
            if (hash_equals(self::codeAt($this->user->two_factor_secret, $step), $code)) {
                // Each code works once: someone looking over a shoulder can't reuse it.
                return Cache::add("two-factor-used:{$this->user->id}:{$step}", true, self::STEP * (2 * self::WINDOW + 2));
            }
        }

        return false;
    }

    private static function generateSecret(): string
    {
        $secret = '';
        $bits = '';
        foreach (str_split(random_bytes(20)) as $byte) {
            $bits .= str_pad(decbin(ord($byte)), 8, '0', STR_PAD_LEFT);
        }
        foreach (str_split($bits, 5) as $chunk) {
            $secret .= self::ALPHABET[bindec(str_pad($chunk, 5, '0'))];
        }

        return $secret;
    }

    private static function base32Decode(string $secret): string
    {
        $bits = '';
        foreach (str_split(strtoupper(rtrim($secret, '='))) as $char) {
            $bits .= str_pad(decbin(strpos(self::ALPHABET, $char)), 5, '0', STR_PAD_LEFT);
        }

        return implode('', array_map(fn ($byte) => chr(bindec($byte)), str_split(substr($bits, 0, intdiv(strlen($bits), 8) * 8), 8)));
    }
}
