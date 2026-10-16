import { Check } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
import { FieldError, TextInput } from "./Form";

/** The password rule (F13), mirrored from Password::defaults() in AppServiceProvider. */
export const passwordRules = [
	{ label: "At least 12 characters", test: (value: string) => value.length >= 12 },
	{ label: "Upper and lower case", test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
	{ label: "At least one number", test: (value: string) => /\d/.test(value) }
];

const levels = ["Too weak", "Weak", "Fair", "Strong"];

export function PasswordField({
	label = "Password",
	value,
	onChange,
	error,
	autoComplete = "new-password",
	showRules = true
}: {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	autoComplete?: string;
	showRules?: boolean;
}) {
	const id = useId();
	const [visible, setVisible] = useState(false);
	const passed = passwordRules.filter(rule => rule.test(value)).length;
	const level = value ? Math.min(3, passed + (value.length >= 16 ? 1 : 0) - (passed < 3 ? 1 : 0)) : 0;

	return (
		<div>
			<label htmlFor={id} className="block text-base font-bold">
				{label}
				<span aria-hidden="true" className="text-rust">
					{" "}
					*
				</span>
			</label>
			<div className="relative mt-2">
				<TextInput
					id={id}
					type={visible ? "text" : "password"}
					autoComplete={autoComplete}
					required
					value={value}
					onChange={event => onChange(event.target.value)}
					aria-invalid={!!error}
					aria-describedby={showRules ? `${id}-rules` : undefined}
					className="h-14 pr-21"
				/>
				<button type="button" aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute top-1.5 right-1.5 h-11 rounded-md px-3.5 text-[15.5px] font-bold text-link hover:bg-teal-50">
					{visible ? "Hide" : "Show"}
				</button>
			</div>
			{showRules && (
				<>
					<div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
						{[0, 1, 2, 3].map(index => (
							<span key={index} className={cn("h-1.5 rounded-full transition-colors", value && index <= level ? "bg-teal-300" : "bg-line")} />
						))}
					</div>
					<div className="mt-2.5 flex flex-wrap items-start justify-between gap-x-6 gap-y-1.5">
						<ul id={`${id}-rules`} className="flex flex-wrap gap-x-5 gap-y-1.5 text-[14.5px] text-ink-muted">
							{passwordRules.map(rule => {
								const ok = rule.test(value);
								return (
									<li key={rule.label} className={cn("flex items-center gap-1.5 whitespace-nowrap", ok && "text-ink")}>
										<Check size={14} strokeWidth={2.6} aria-hidden="true" className={ok ? "text-teal-500" : "text-line-strong"} />
										{rule.label}
										<span className="sr-only">{ok ? "(met)" : "(not met yet)"}</span>
									</li>
								);
							})}
						</ul>
						{value && (
							<p aria-hidden="true" className="text-[14.5px] font-bold whitespace-nowrap">
								{levels[Math.max(0, level)]}
							</p>
						)}
					</div>
				</>
			)}
			{error && <FieldError className="mt-2">{error}</FieldError>}
		</div>
	);
}
