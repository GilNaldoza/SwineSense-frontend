import { useState, type ChangeEvent, type FormEvent, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { yearLevels, colleges, departmentsByCollege } from "@/lib/colleges"

export type StudentValues = {
  studentId?: string
  firstName?: string
  lastName?: string
  department?: string
  college?: string
  yearLevel?: string
  userType?: 'student' | 'faculty'
}

type StudentFormProps = {
  initialValues?: StudentValues
  submitText?: string
  onSubmit?: (values: StudentValues) => void
  disabled?: boolean
  className?: string
}

const defaultValues: StudentValues = {
  studentId: "",
  firstName: "",
  lastName: "",
  department: "",
  college: "",
  yearLevel: "",
  userType: "student",
}

export default function StudentForm({
  initialValues = {},
  submitText = "Save",
  onSubmit,
  disabled,
  className,
}: StudentFormProps) {
  const [values, setValues] = useState<StudentValues>({
    ...defaultValues,
    ...initialValues,
  })

  useEffect(() => {
     if (initialValues) {
         setValues(prev => ({...defaultValues, ...prev, ...initialValues}))
     }
  }, [initialValues])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setValues((prev) => {
        const next = { ...prev, [name]: value }
        if (name === 'college') {
            next.department = ''
        }
        return next
    })
  }

  const deptOptions = departmentsByCollege[values.college || ''] || []

  const handleSubmit = (e?: FormEvent) => {
      e?.preventDefault()
      onSubmit?.(values)
  }

  return (
    <div className={cn("grid gap-4", className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">User Type</label>
              <Select 
                name="userType"
                value={values.userType} 
                onChange={handleChange} 
                disabled={disabled} 
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{values.userType === 'faculty' ? 'Faculty ID' : 'Student ID'}</label>
              <Input name="studentId" value={values.studentId} onChange={handleChange} disabled={disabled} placeholder="e.g. 2021-0000" />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div>
              <label className="text-sm font-medium mb-1 block">First Name</label>
              <Input name="firstName" value={values.firstName} onChange={handleChange} disabled={disabled} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Last Name</label>
              <Input name="lastName" value={values.lastName} onChange={handleChange} disabled={disabled} />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">College</label>
               <Select 
                name="college"
                value={values.college} 
                onChange={handleChange} 
                disabled={disabled} 
               >
                <option value="">Select college</option>
                {colleges.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Department</label>
               <Select 
                name="department"
                value={values.department} 
                onChange={handleChange} 
                disabled={disabled} 
               >
                <option value="">Select department</option>
                {deptOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
        </div>

        {values.userType === 'student' && (
            <div>
                 <label className="text-sm font-medium mb-1 block">Year Level</label>
                 <Select 
                    name="yearLevel"
                    value={values.yearLevel} 
                    onChange={handleChange} 
                    disabled={disabled} 
                 >
                    <option value="">Select year level</option>
                    {yearLevels.map(y => <option key={y} value={y}>{y}</option>)}
                 </Select>
            </div>
        )}

        <div className="flex justify-end pt-4">
             <Button type="button" onClick={() => handleSubmit()} disabled={disabled} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {submitText}
             </Button>
        </div>
    </div>
  )
}
