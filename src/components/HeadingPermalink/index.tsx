import type { ComponentChildren, HTMLAttributes, VNode } from "preact";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as: HeadingTag;
  children?: ComponentChildren;
  id?: string;
};

type HeadingOverrideProps = Omit<HeadingProps, "as">;

const joinClasses = (...classes: unknown[]) =>
  classes
    .filter((value): value is string => typeof value === "string")
    .join(" ");

export const HeadingPermalink = ({
  as: Tag,
  children,
  class: classProp,
  className,
  id,
  ...props
}: HeadingProps) => {
  const hasPermalink = typeof id === "string" && id.length > 0;

  const mergedClassName = joinClasses(
    "heading-permalink",
    hasPermalink && "heading-permalink--enabled",
    classProp,
    className,
  );

  return (
    <Tag {...props} id={id} class={mergedClassName}>
      {hasPermalink ? (
        <a href={`#${id}`} class="heading-permalink__link">
          {children}
        </a>
      ) : (
        children
      )}
    </Tag>
  );
};

const createHeadingOverride = (as: HeadingTag) => {
  const Component = (props: HeadingOverrideProps): VNode => (
    <HeadingPermalink {...props} as={as} />
  );

  Component.displayName = `HeadingPermalink${as.toUpperCase()}`;
  return Component;
};

export const HeadingPermalinkH1 = createHeadingOverride("h1");
export const HeadingPermalinkH2 = createHeadingOverride("h2");
export const HeadingPermalinkH3 = createHeadingOverride("h3");
export const HeadingPermalinkH4 = createHeadingOverride("h4");
export const HeadingPermalinkH5 = createHeadingOverride("h5");
export const HeadingPermalinkH6 = createHeadingOverride("h6");
