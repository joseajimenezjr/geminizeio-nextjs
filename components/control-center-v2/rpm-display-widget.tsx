// components/control-center-v2/rpm-display-widget.tsx

import type React from "react"

interface RPMDisplayWidgetProps {
  rpm: number
}

const RPMDisplayWidget: React.FC<RPMDisplayWidgetProps> = ({ rpm }) => {
  return (
    <div>
      <h2>RPM</h2>
      <p>{rpm}</p>
    </div>
  )
}

export { RPMDisplayWidget }
