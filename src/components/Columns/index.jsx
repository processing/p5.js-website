// TODO: layout vertically when the screen is small?
export const Columns = (props) => (
  <div class="full-width mt-md flex flex-col flex-wrap max-w-[100%] items-stretch justify-start lg:flex-row lg:items-start">
    {props.children}
  </div>
);

export const Column = (props) => (
  <div class={`mb-md mr-md flex-1 max-w-[100%] ${props.class || ''} ${props.fixed ? 'grow-0' : 'min-w-[400px]'}`}>{props.children}</div>
);
