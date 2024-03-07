// TODO: layout vertically when the screen is small?
export const Columns = (props) => (
  <div class="flex flex-row items-start justify-start">
    {props.children}
  </div>
)

export const Column = (props) => (
  <div class="flex-1">
    {props.children}
  </div>
)
