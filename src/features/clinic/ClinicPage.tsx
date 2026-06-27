import { useNavigate } from 'react-router-dom'
import {
  Stethoscope,
  ArrowRight,
  Phone,
  Calendar,
  Users,
  Search,
  Plus,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockPatients } from '@/data/clinic'

export default function ClinicPage() {
  const navigate = useNavigate()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <Stethoscope className="size-5" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Clinic Module
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Patients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage patient records, visits, and prescriptions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
            <Search className="size-3.5" />
            Search
          </Button>
          <Button size="sm" className="gap-1.5 shadow-sm">
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">New Patient</span>
          </Button>
        </div>
      </div>

      {/* Search bar (mobile) */}
      <div className="relative sm:hidden">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search patients..."
          className="w-full h-10 pl-9 pr-3 rounded-xl border border-input bg-background text-sm outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-colors"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Users className="size-4" />
            </div>
            <div className="text-xl font-bold">{mockPatients.length}</div>
            <div className="text-xs text-muted-foreground">Total Patients</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-emerald-500 mb-1">
              <Calendar className="size-4" />
            </div>
            <div className="text-xl font-bold">7</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-amber-500 mb-1">
              <Stethoscope className="size-4" />
            </div>
            <div className="text-xl font-bold">3</div>
            <div className="text-xs text-muted-foreground">Follow-ups</div>
          </CardContent>
        </Card>
      </div>

      {/* Patient grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockPatients.map((patient) => {
          const initials = patient.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)

          return (
            <button
              key={patient.id}
              onClick={() => navigate(`/clinic/patient/${patient.id}`)}
              className="group text-left"
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-primary/30 active:scale-[0.98]">
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-base font-bold text-primary">
                        {initials}
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mt-1" />
                    </div>

                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      {patient.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <span>{patient.gender === 'male' ? 'Male' : 'Female'}, {patient.age} yrs</span>
                      {patient.bloodGroup && (
                        <>
                          <span>·</span>
                          <span>{patient.bloodGroup}</span>
                        </>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="size-3" />
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>Registered {patient.registrationDate}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        Last visit: {patient.lastVisit || '—'}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                        View Profile
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          )
        })}
      </div>
    </div>
  )
}
