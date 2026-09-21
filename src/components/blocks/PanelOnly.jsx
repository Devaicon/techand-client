import SplitTabsCard from "./SplitTabsCard";
import { PAGE_INSET } from "./layout";
import { toneOf } from "./tone";

export default function PanelOnly({ props }) {
  const {
    eyebrow,
    heading,
    subtitle,
    photo,
    photoEyebrow,
    photoTitle,
    photoBody,
    tabs,
    panelLink,
  } = props;

  const { bg } = toneOf("cream");

  return (
    <div className={`${bg} ${PAGE_INSET} py-12 md:py-20`}>
      <SplitTabsCard
        eyebrow={eyebrow}
        heading={heading}
        subtitle={subtitle}
        tabs={tabs}
        image={photo}
        imageEyebrow={photoEyebrow}
        imageTitle={photoTitle}
        imageBody={photoBody}
        link={panelLink}
      />
    </div>
  );
}
