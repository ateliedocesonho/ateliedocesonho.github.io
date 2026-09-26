interface BrandProps {
  small?: boolean
}

export function Brand({ small = false }: BrandProps) {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={`${import.meta.env.BASE_URL}inspiration/logo.jpg`}
        className={`${small ? 'h-10 w-10' : 'h-14 w-14'} rounded-full border border-[#eaded4] object-cover`}
        alt=""
      />
      <span className="serif leading-tight text-[#541720]">
        <span className="block text-[13px] font-semibold tracking-[.13em]">
          ATELIÊ
        </span>
        <span className="block text-sm">Doce Sonho</span>
      </span>
    </div>
  )
}
