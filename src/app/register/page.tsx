import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <h1 className="text-2xl font-bold">注册</h1>
        <RegisterForm />
      </Card>
    </div>
  );
}
