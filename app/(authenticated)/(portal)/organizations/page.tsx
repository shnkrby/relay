import { JoinOrgCard } from './_components/join-org-card'
import { CreateOrgCard } from './_components/create-org-card'

export default function OrganizationsGatewayPage() {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-10 mt-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Where are you heading today?</h1>
        <p className="mt-2 text-lg text-slate-600">
          Get started by joining an existing organization or creating a new one.
        </p>
      </div>

      <div className="grid w-full gap-8 md:grid-cols-2">
        <JoinOrgCard />
        <CreateOrgCard />
      </div>
    </div>
  )
}
