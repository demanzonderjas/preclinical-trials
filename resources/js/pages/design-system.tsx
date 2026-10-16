import { FileText, Search, Stamp } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Badge, CountBubble, EmbargoBadge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonAnchor } from "@/components/ui/Button";
import { ArrowLink, Avatar, Card, Diff, EmptyState, Note, Panel, SectionHeading } from "@/components/ui/Content";
import { Checkbox, Field, RadioCards, Select, Switch, TextInput, Textarea } from "@/components/ui/Form";
import { DataTable, Dialog, FlashMessage, Pagination, Tabs } from "@/components/ui/Interactive";
import { Loader } from "@/components/ui/Loader";
import { LogoMark, Wordmark } from "@/components/ui/Logo";
import { ProcessSteps } from "@/components/ui/ProcessSteps";
import { ProtocolCard } from "@/components/ui/ProtocolCard";
import { AdminLayout, AuthLayout, PublicLayout, WorkspaceLayout } from "@/layouts/Layouts";

/**
 * Every token and component of the A2 design system on one page, for comparing with the
 * A2 Brand board. Shown in each layout via ?layout=public|auth|workspace|admin.
 */
export default function DesignSystem({ layout }: { layout: "public" | "auth" | "workspace" | "admin" }) {
	const content = <Kit layout={layout} />;
	if (layout === "auth") return <AuthLayout title="Design system">{content}</AuthLayout>;
	if (layout === "workspace") return <WorkspaceLayout title="Design system" counts={{ protocols: 5, unreadMessages: 2 }}>{content}</WorkspaceLayout>;
	if (layout === "admin") return <AdminLayout title="Design system" counts={{ awaitingReview: 4, embargoRequests: 2 }}>{content}</AdminLayout>;
	return <PublicLayout title="Design system">{content}</PublicLayout>;
}

function Block({ title, children, note }: { title: string; children: ReactNode; note?: ReactNode }) {
	return (
		<div>
			<h3 className="text-xl font-extrabold tracking-[-0.015em]">{title}</h3>
			<div className="mt-4.5">{children}</div>
			{note && <p className="mt-2.5 text-sm leading-[1.45] text-ink-muted">{note}</p>}
		</div>
	);
}

const palette: { group: string; colors: [string, string, string][] }[] = [
	{
		group: "Grounds",
		colors: [
			["white", "#FFFFFF", "Page, cards, inputs"],
			["mist", "#F3F7F8", "Alternating bands, footer"],
			["teal-50", "#E6F0F1", "Heroes, soft chips, panels"],
			["line", "#D2D6DD", "Hairlines, borders"]
		]
	},
	{
		group: "Text and actions",
		colors: [
			["ink", "#323742", "Text, primary button"],
			["ink-muted", "#585F6F", "Secondary text"],
			["line-strong", "#A5ACBB", "Secondary button border"],
			["link", "#2C6FAA", "Links, focus ring"]
		]
	},
	{
		group: "Teal",
		colors: [
			["teal-200", "#B5D1D6", "Lines on tint, avatar"],
			["teal-300", "#83B2BA", "Shapes, step rings, charts"],
			["teal-500", "#558F99", "Icons, “.eu”, large text only"],
			["blue-100", "#BDD7EE", "Data tint, submitted"]
		]
	},
	{
		group: "Warm accent and data",
		colors: [
			["peach-100", "#FFE2D7", "Soft panels, needs changes"],
			["peach-300", "#FFA888", "The one special CTA"],
			["blue-400", "#68A4D8", "Chart emphasis"],
			["ink-subtle", "#798399", "Input borders"]
		]
	}
];

function Kit({ layout }: { layout: string }) {
	const [stage, setStage] = useState<string | null>("study_stage_2_value");
	const [notify, setNotify] = useState(true);
	const [tab, setTab] = useState("all");
	const [dialog, setDialog] = useState(false);

	return (
		<div className="container-page grid gap-16 py-12 lg:py-20">
			<SectionHeading
				as="h1"
				size="xl"
				eyebrow="Design system"
				title="Clear Lens, muted"
				lead="The PreclinicalTrials.eu identity in its calm form. Compare with the A2 Brand board; switch the layout below to check the headers."
				aside={
					<div className="flex flex-wrap gap-2">
						{["public", "auth", "workspace", "admin"].map(name => (
							<ButtonAnchor key={name} href={`?layout=${name}`} size="sm" variant={name === layout ? "primary" : "secondary"}>
								{name}
							</ButtonAnchor>
						))}
					</div>
				}
			/>

			<section className="grid gap-10 lg:grid-cols-2">
				<Block title="Logo" note="Wordmark in Manrope 800, “.eu” in teal. On pale teal the glass turns white.">
					<div className="grid gap-4 sm:grid-cols-2">
						<Card className="flex items-center gap-2.5 p-8">
							<LogoMark />
							<Wordmark />
						</Card>
						<div className="flex items-center gap-2.5 rounded-card bg-teal-50 p-8">
							<LogoMark glass="white" />
							<Wordmark />
						</div>
					</div>
					<div className="mt-4 flex items-end gap-6">
						{[24, 36, 48, 72, 96].map(size => (
							<div key={size} className="text-center">
								<LogoMark size={size} />
								<p className="mt-2 text-2xs text-ink-muted">{size} px</p>
							</div>
						))}
					</div>
				</Block>
				<Block title="Loader" note="The lens breathes (scale 1 to 1.06, 2.4 s) while the second line reads along.">
					<div className="flex h-64 items-center justify-center rounded-card bg-teal-50">
						<Loader label="Loading protocols…" />
					</div>
				</Block>
			</section>

			<Block title="Colour">
				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{palette.map(group => (
						<div key={group.group}>
							<p className="eyebrow">{group.group}</p>
							<ul className="mt-3 grid gap-2.5">
								{group.colors.map(([name, hex, use]) => (
									<li key={name} className="flex items-center gap-3">
										<span className="size-11 shrink-0 rounded-xl shadow-[inset_0_0_0_1px_rgb(50_55_66/0.12)]" style={{ background: hex }} />
										<span className="text-sm leading-tight">
											<span className="block font-bold">
												{name} <span className="font-normal text-ink-muted">{hex}</span>
											</span>
											<span className="text-ink-muted">{use}</span>
										</span>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</Block>

			<Block title="Typography" note="Manrope for headings, numbers, buttons and IDs. Source Sans 3 for everything you read.">
				<div className="grid gap-6">
					<p className="font-display text-4xl leading-[1.05] font-extrabold tracking-[-0.035em] sm:text-6xl">See the plan</p>
					<p className="font-display text-3xl leading-[1.1] font-extrabold tracking-[-0.03em] sm:text-4xl">The register at a glance</p>
					<p className="font-display text-lg leading-[1.3] font-bold">Effect of Sodium Bicarbonate Administration in Asphyxiated Newborn Piglets</p>
					<p className="eyebrow">How registration works</p>
					<p className="max-w-2xl text-lg leading-[1.55] text-ink-muted">One form and a short check by the PCT team. Nothing becomes public until you submit and it is approved.</p>
					<p className="max-w-2xl leading-relaxed">
						Registration of your study requires you to create an account. The register is web-based and open to all types of animal studies.{" "}
						<a href="#">An inline link</a>.
					</p>
					<p className="pct-id text-lg">PCTE0000652</p>
				</div>
			</Block>

			<section className="grid gap-12 lg:grid-cols-[7fr_5fr]">
				<div className="grid gap-11">
					<Block title="Buttons" note="Slate primary · outlined secondary · one peach call to action per page at most · text link.">
						<div className="flex flex-wrap items-center gap-3">
							<Button arrow>Register a protocol</Button>
							<Button variant="secondary" icon={<Search size={18} strokeWidth={2.2} aria-hidden="true" />}>
								Search the database
							</Button>
							<Button variant="accent" size="lg" arrow>
								Start with a free account
							</Button>
							<ArrowLink href="#">More about our goals</ArrowLink>
						</div>
						<div className="mt-3 flex flex-wrap items-center gap-3">
							<Button size="sm">Small</Button>
							<Button size="sm" variant="ghost">
								Ghost
							</Button>
							<Button size="sm" variant="danger">
								Delete draft
							</Button>
							<Button size="sm" disabled>
								Disabled
							</Button>
						</div>
					</Block>
					<Block title="Status badges and chips">
						<div className="flex flex-wrap gap-2.5">
							<StatusBadge status="draft" />
							<StatusBadge status="submitted_for_publication" />
							<StatusBadge status="resubmitted_for_publication" />
							<StatusBadge status="published" />
							<StatusBadge status="rejected" />
							<EmbargoBadge until="14 Mar 2027" />
							<Badge tone="peach">Before study start</Badge>
							<Badge tone="neutral" dot="grey" className="font-semibold">
								Completed, not published
							</Badge>
							<Badge tone="teal">Pig</Badge>
							<CountBubble count={5} />
							<CountBubble count={2} tone="peach" label="2 unread" />
						</div>
					</Block>
					<Block title="Form controls">
						<div className="grid gap-5">
							<Field label="Title" required help="Enter the full title of the study">
								{({ id, describedBy }) => <TextInput id={id} aria-describedby={describedBy} defaultValue="Effect of early mobilisation on infarct healing in a porcine MI model" />}
							</Field>
							<Field label="Species" required>
								{({ id }) => (
									<Select id={id} defaultValue="pig">
										<option value="pig">Pig</option>
										<option value="mouse">Mouse</option>
										<option value="rat">Rat</option>
									</Select>
								)}
							</Field>
							<RadioCards
								name="stage"
								label="Study stage"
								value={stage}
								onChange={setStage}
								options={[
									{ value: "study_stage_2_value", label: "Stage 2 – Confirmatory study", description: "Hypothesis testing" },
									{ value: "study_stage_1_value", label: "Stage 1 – Exploratory study", description: "Hypothesis generating" }
								]}
							/>
							<Checkbox label="I confirm that the information provided in this form is true, complete and accurate" defaultChecked />
							<Switch checked={notify} onChange={setNotify} label="I want to receive notifications about new messages" />
							<Field label="Justify number of animals" required error="Please add the sample size calculation.">
								{({ id, describedBy, invalid }) => <Textarea id={id} aria-describedby={describedBy} aria-invalid={invalid} />}
							</Field>
						</div>
					</Block>
					<Block title="Recorded changes">
						<p className="leading-relaxed">
							Sum of animals: <Diff removed="30" added="36" />
						</p>
						<Note className="mt-3.5">Changes made after publication will be recorded with an audit trail.</Note>
					</Block>
				</div>
				<div className="grid content-start gap-11">
					<Block title="Protocol card">
						<ProtocolCard
							protocol={{
								id: 724,
								pctId: "PCTE0000724",
								title: "The bactericidal combination of D-amino acids and antimicrobial peptides for the treatment of mastitis in goats",
								summary:
									"Antibiotic-resistant pathogens, including multidrug-resistant strains, pose a serious global (veterinary) health threat and there is a clear need for novel antimicrobials.",
								studyStatus: "Active",
								centre: "Utrecht University · Utrecht, NL",
								period: "Jul 2026 – Aug 2026",
								species: "Goat",
								field: "Microbiology",
								registeredOn: "30 Jul 2026",
								registeredBeforeStart: true,
								href: "#"
							}}
							className="min-h-[444px]"
						/>
					</Block>
					<Block title="Process step">
						<ProcessSteps
							className="xl:grid-cols-2"
							steps={[
								{ title: "Fill in the protocol", text: "Save drafts at any time, or import from PRIS or APAFiS.", icon: <FileText size={26} strokeWidth={1.8} aria-hidden="true" /> },
								{
									title: "Published with a PCT ID",
									text: "Permanent and time-stamped. Later changes are kept as amendments.",
									icon: <Stamp size={26} strokeWidth={1.8} aria-hidden="true" />,
									highlight: true
								}
							]}
						/>
					</Block>
				</div>
			</section>

			<section className="grid gap-12 lg:grid-cols-2">
				<Block title="Tabs">
					<Tabs
						label="Status"
						active={tab}
						onChange={setTab}
						items={[
							{ key: "all", label: "All", count: <CountBubble count={5} /> },
							{ key: "draft", label: "Draft", count: <CountBubble count={1} /> },
							{ key: "published", label: "Published", count: <CountBubble count={2} /> }
						]}
					/>
				</Block>
				<Block title="Dialog, flash and people">
					<div className="flex flex-wrap items-center gap-3">
						<Button variant="secondary" onClick={() => setDialog(true)}>
							Open a dialog
						</Button>
						<Avatar initials="SV" />
						<Avatar initials="PCT" tone="slate" />
					</div>
					<div className="mt-4 grid gap-3">
						<FlashMessage tone="success">Your protocol was submitted for publication.</FlashMessage>
						<FlashMessage tone="error">Something went wrong. Please try again.</FlashMessage>
					</div>
					<Dialog
						open={dialog}
						onClose={() => setDialog(false)}
						title="Delete this draft?"
						description="This removes a draft that was never submitted. This can’t be undone."
						footer={
							<>
								<Button variant="secondary" onClick={() => setDialog(false)}>
									Cancel
								</Button>
								<Button variant="danger" onClick={() => setDialog(false)}>
									Delete draft
								</Button>
							</>
						}
					/>
				</Block>
			</section>

			<Block title="Table (cards below 768 px) and pagination">
				<Panel className="p-6">
					<DataTable
						caption="Protocols awaiting review"
						rowKey={row => row.id}
						rows={[
							{ id: "PCTE0000742", title: "Dapagliflozin and cardiac remodelling after ischemia-reperfusion", status: "resubmitted_for_publication" as const, updated: "9 Sep 2026" },
							{ id: "PCTE0000745", title: "Microbiome transfer and post-stroke recovery in aged rats", status: "submitted_for_publication" as const, updated: "24 Sep 2026" }
						]}
						columns={[
							{ key: "title", header: "Protocol", primary: true, cell: row => row.title },
							{ key: "id", header: "PCT ID", cell: row => <span className="pct-id text-sm">{row.id}</span> },
							{ key: "status", header: "Status", cell: row => <StatusBadge status={row.status} /> },
							{ key: "updated", header: "Last updated", cell: row => row.updated }
						]}
					/>
					<Pagination
						className="mt-6"
						summary="Showing 1–10 of 151"
						links={[
							{ url: null, label: "« Previous", active: false },
							{ url: "?page=1", label: "1", active: true },
							{ url: "?page=2", label: "2", active: false },
							{ url: "?page=3", label: "3", active: false },
							{ url: "?page=2", label: "Next »", active: false }
						]}
					/>
				</Panel>
			</Block>

			<Block title="Empty state">
				<EmptyState title="No protocols yet" action={<Button arrow>Register a protocol</Button>}>
					Register your study before it starts, so others don’t repeat it.
				</EmptyState>
			</Block>
		</div>
	);
}
