"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import styles from "./PartnerContactCard.module.css";

export default function PartnerContactCard() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.decorTop} aria-hidden>
            <Image
              src="/partner-contact-top-right.webp"
              alt=""
              width={75}
              height={75}
              className={styles.topRightImg}
            />
          </div>
          <div className={styles.decorBottom} aria-hidden>
            <Image
              src="/partner-contact-bottom-left.webp"
              alt=""
              width={75}
              height={75}
              className={styles.bottomLeftImg}
            />
          </div>
          <div className={styles.contentLeft}>
            <h2 className={styles.title}>
              Organizations that partner with Tech& achieve measurable business
              impact.
            </h2>
            <p className={styles.subtitle}>Your transformation starts here.</p>
          </div>

          <div className={styles.contentRight}>
            <div className={styles.contactBox}>
              <div className={styles.iconWrap}>
                <div className={styles.iconBg}>
                  <Mail className={styles.icon} />
                </div>
              </div>
              <div className={styles.contactText}>
                <div className={styles.contactTitle}>Send us an email</div>
                <a
                  href="mailto:contact@techand.ai"
                  className={styles.contactInfo}
                >
                  contact@techand.ai
                </a>
              </div>
            </div>

            <div className={styles.contactBox}>
              <div className={styles.iconWrap}>
                <div className={styles.iconBg}>
                  <Phone className={styles.icon} />
                </div>
              </div>
              <div className={styles.contactText}>
                <div className={styles.contactTitle}>Give us a call</div>
                <a href="tel:+971507020541" className={styles.contactInfo}>
                  +971 50 702 0541
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
