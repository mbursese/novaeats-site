import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/nova-logo.png"
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 rounded-full object-cover"
      />
      <span className="text-[15px] font-semibold tracking-tight">Nova Eats</span>
    </span>
  );
}
