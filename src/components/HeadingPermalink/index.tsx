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

const isVNode = (child: ComponentChildren): child is VNode =>
  typeof child === "object" && child !== null && "type" in child;

const childrenContainAnchor = (children: ComponentChildren): boolean => {
  if (Array.isArray(children)) {
    return children.some(childrenContainAnchor);
  }

  if (!isVNode(children)) {
    return false;
  }

  if (children.type === "a") {
    return true;
  }

  return childrenContainAnchor(children.props?.children);
};

const getChildText = (children: ComponentChildren): string => {
  if (Array.isArray(children)) {
    return children.map(getChildText).join("").trim();
  }

  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (!isVNode(children)) {
    return "";
  }

  if (children.type === "img") {
    const imgProps = children.props as { alt?: unknown };
    if (typeof imgProps.alt === "string") {
      return imgProps.alt;
    }
  }

  return getChildText(children.props?.children);
};

export const HeadingPermalink = ({
  as: Tag,
  children,
  class: classProp,
  className,
  id,
  ...props
}: HeadingProps) => {
  const hasPermalink = typeof id === "string" && id.length > 0;
  const hasNestedAnchor = childrenContainAnchor(children);
  const headingText = getChildText(children);

  const mergedClassName = joinClasses(
    "heading-permalink",
    hasPermalink && "heading-permalink--enabled",
    hasPermalink && hasNestedAnchor && "heading-permalink--with-marker",
    classProp,
    className,
  );

  return (
    <Tag {...props} id={id} class={mergedClassName}>
      {hasPermalink && !hasNestedAnchor ? (
        <a href={`#${id}`} class="heading-permalink__link">
          {children}
        </a>
      ) : (
        children
      )}
      {hasPermalink && hasNestedAnchor && (
        <a href={`#${id}`} class="heading-permalink__marker">
          <span class="sr-only">
            {headingText ? `Permalink to ${headingText}` : "Permalink"}
          </span>
        </a>
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

export const headingPermalinkComponents = {
  h1: HeadingPermalinkH1,
  h2: HeadingPermalinkH2,
  h3: HeadingPermalinkH3,
  h4: HeadingPermalinkH4,
  h5: HeadingPermalinkH5,
  h6: HeadingPermalinkH6,
};
