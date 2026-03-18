"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import styles from "./Insights.module.css";
import Link from "next/link";

export default function InsightCards({
  image,
  tag,
  readTime,
  title,
  description,
  slug,
  comingSoon = false,
}) {
  return (
    <article
      className={`${styles.card} ${comingSoon ? styles.cardDisabled : ""}`}
    >
      {/* Image */}
      <div className={styles.imageWrapper}>
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* BLOG Badge */}
        <div className={styles.blogBadge}>BLOG</div>

        {/* Coming Soon Overlay */}
        {comingSoon && (
          <div className={styles.comingSoonOverlay}>
            <span className={styles.comingSoonTag}>COMING SOON</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Tag and Read Time */}
        <div className={styles.tagReadTime}>
          <span className={styles.tag}>{tag}</span>
          <span className={styles.readTime}>{readTime}</span>
        </div>

        {/* Title */}
        <h3 className={styles.title}>{title}</h3>

        {/* Description */}
        <p className={styles.description}>{description}</p>

        {/* Read More Link */}
        {comingSoon ? (
          <button
            className={`${styles.readMore} ${styles.readMoreDisabled}`}
            disabled
            aria-label="Coming soon"
          >
            Read more
            <ArrowRight className={styles.readMoreIcon} />
          </button>
        ) : (
          <Link
            href={`/insights/${slug}`}
            className={styles.readMore}
            aria-label={`Read more about ${title}`}
          >
            Read more
            <ArrowRight className={styles.readMoreIcon} />
          </Link>
        )}
      </div>
    </article>
  );
}
