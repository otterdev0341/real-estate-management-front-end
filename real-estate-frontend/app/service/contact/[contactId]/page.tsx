"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ContactService } from "@/service/contact/ContactService"
import { isLeft, isRight } from "@/implementation/Either"
import { Skeleton } from "@/components/ui/skeleton"
import ResEntryContactDto from "@/domain/contact/contact/ResEntryContactDto"

const FIELD_LABELS: { [key in keyof ResEntryContactDto]: string } = {
	id: "ID",
	businessName: "Business Name",
	internalName: "Internal Name",
	detail: "Detail",
	note: "Note",
	contactType: "Contact Type",
	address: "Address",
	phone: "Phone",
	mobilePhone: "Mobile Phone",
	line: "Line",
	email: "Email",
}

const ContactPage = () => {
	const params = useParams()
	const contactId = typeof params.contactId === "string" ? params.contactId : ""
	const [contact, setContact] = useState<ResEntryContactDto | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState("")

	useEffect(() => {
		const fetchContact = async () => {
			setLoading(true)
			setError("")
			const result = await ContactService.instance.fetchContactById(contactId)
			if (isRight(result)) {
				setContact(result.value)
			} else if (isLeft(result)) {
				setError(result.value.message || "Failed to fetch contact")
			}
			setLoading(false)
		}
		if (contactId) fetchContact()
	}, [contactId])

	return (
		<div className="min-h-screen bg-background p-4 sm:p-6">
			<div className="max-w-3xl mx-auto space-y-6">
				<h1 className="text-2xl text-left font-bold sm:ml-6">
					Contact Details
				</h1>
				<div className="flex-1" />
				<div className="bg-card/60 backdrop-blur-xl border border-border rounded-xl p-4 sm:p-6 shadow-lg relative overflow-x-auto">
					{loading ? (
						<div className="space-y-4">
							<Skeleton className="h-8 w-1/2 mb-4" />
							<Skeleton className="h-6 w-full mb-2" />
							<Skeleton className="h-20 w-full mb-4" />
							<Skeleton className="h-6 w-1/3" />
							<Skeleton className="h-6 w-1/3 mt-2" />
						</div>
					) : error ? (
						<div className="text-red-500">{error}</div>
					) : contact ? (
						<table className="min-w-full text-sm">
							<thead>
								<tr className="bg-muted">
									<th className="px-3 py-2 text-left font-semibold text-muted-foreground">
										Field
									</th>
									<th className="px-3 py-2 text-left font-semibold text-muted-foreground">
										Value
									</th>
								</tr>
							</thead>
							<tbody>
								{Object.keys(FIELD_LABELS).map((key) => (
									<tr key={key}>
										<td className="px-3 py-2 font-semibold">
											{
												FIELD_LABELS[key as keyof ResEntryContactDto]
											}
										</td>
										<td className="px-3 py-2">
											{key === "id"
												? contact.id
													? contact.id.slice(0, 6)
													: "-"
												: (contact as any)[key] ?? "-"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<div className="text-muted-foreground">
							Contact not found.
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default ContactPage