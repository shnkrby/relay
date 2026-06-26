import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function OrganizationsGatewayPage() {
  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-10 mt-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to Relay</h1>
        <p className="mt-2 text-lg text-slate-600">
          Get started by joining an existing organization or creating a new one.
        </p>
      </div>

      <div className="grid w-full gap-8 md:grid-cols-2">
        {/* Join Organization Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Join an Organization</CardTitle>
            <CardDescription>
              Have a join code from your team? Enter it below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between">
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="joinCode">Join Code</Label>
                <Input
                  id="joinCode"
                  name="joinCode"
                  placeholder="e.g. RELAY-1234"
                  required
                />
              </div>
              <Button type="button" className="w-full mt-auto">
                Join Organization
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Create Organization Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl">Create a New Organization</CardTitle>
            <CardDescription>
              Start a new workspace for your team and manage events.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between">
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input
                  id="orgName"
                  name="orgName"
                  placeholder="Acme Corp"
                  required
                />
              </div>
              <Button type="button" variant="secondary" className="w-full mt-auto">
                Create Organization
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
