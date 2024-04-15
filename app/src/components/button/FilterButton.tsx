"use client"

type Props = {
   title: string
   selected: boolean
   onClick: () => void
}

const FilterButton = ({ title, selected, onClick }: Props) => (
   <div
      className={`min-w-fit px-3 py-1 ${selected ? "bg-white" : "bg-gray-7"} rounded-full cursor-pointer`}
      onClick={onClick}
   >
      <p className={`text-xs font-semibold ${selected ? "text-black" : "text-white"}`}>
         {title}
      </p>
   </div>
)

export default FilterButton
