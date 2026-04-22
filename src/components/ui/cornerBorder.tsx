const CornerBorder = () => {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* top-left */}
      <span className="bg-crilli-600 absolute top-2 left-2 h-px w-12" />
      <span className="bg-crilli-600 absolute top-2 left-2 h-12 w-px" />
      {/* top-right */}
      <span className="bg-crilli-600 absolute top-2 right-2 h-px w-12" />
      <span className="bg-crilli-600 absolute top-2 right-2 h-12 w-px" />
      {/* bottom-left */}
      <span className="bg-crilli-600 absolute bottom-2 left-2 h-px w-12" />
      <span className="bg-crilli-600 absolute bottom-2 left-2 h-12 w-px" />
      {/* bottom-right */}
      <span className="bg-crilli-600 absolute right-2 bottom-2 h-px w-12" />
      <span className="bg-crilli-600 absolute right-2 bottom-2 h-12 w-px" />
    </div>
  )
}

export default CornerBorder
