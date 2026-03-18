import Link from "next/link";
import styles from "./TransformationCTASection.module.css";
import { ArrowRight } from "lucide-react";

const TransformationCTASection = () => {
  return (
    <section
      className={styles.wrapper}
      aria-labelledby="transformation-cta-heading"
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 id="transformation-cta-heading" className={styles.title}>
            Ready to Transform Your Business?
          </h2>

          <p className={styles.subtitle}>
            Connect with our experts to discover how Tech& can drive measurable
            results for your organization.
          </p>

          <div className={styles.actions}>
            <Link
              href="/contact-us"
              type="button"
              className={`${styles.button} ${styles.primary}`}
              aria-label="Schedule a consultation"
            >
              <span className={styles.buttonContent}>
                Schedule a Consultation
                <ArrowRight size={14} />
              </span>
            </Link>

            <Link
              href="/insights"
              passHref
              type="button"
              className={`${styles.button} ${styles.secondary}`}
              aria-label="Explore insights"
            >
              Explore Insights
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransformationCTASection;
