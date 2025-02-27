import {
  allAncestries,
  allClassItems,
  allRulesDocuments,
  ClassItem,
} from "contentlayer/generated";
import { get, map, pick } from "lodash";
import { GetStaticPathsContext, GetStaticPropsResult } from "next";
import CompendiumCategoryIndexLayout from "@/layouts/compendium-category-index";
import Head from "next/head";
import { buildNav, Navigation } from "@/lib/navigation";
import { useRouter } from "next/router";
import { defaultLocale, supportedLocales } from "@/lib/locales";
import { getI18nProperties } from "@/lib/get-static";
import { PickPartial } from "@/utils";
import { Trans, useTranslation } from "next-i18next";
import CompendiumTitle from "@/components/compendium-title";
import { useMemo } from "react";
import CompendiumContentHero from "@/components/compendium-content-hero";
import { localeContentLayerList } from "@/lib/locale-utils";

type ClassItemListing = PickPartial<
  ClassItem,
  | "slug"
  | "name"
  | "ability_scores"
  | "best_damage_die"
  | "recoveries"
  | "recovery_die"
  | "page_dress"
  | "locale"
>;

interface ClassesPageP {
  classItems: ClassItemListing[];
  navigation: Navigation;
}

export default function AncestriesPage({
  classItems,
  navigation,
}: ClassesPageP) {
  const router = useRouter();
  const { locale = defaultLocale } = router.query;
  const localeString = String(locale);
  const { t } = useTranslation("classes");
  const listFormatter = useMemo(
    () =>
      new Intl.ListFormat(localeString, {
        style: "short",
        type: "disjunction",
      }),
    [localeString]
  );

  return (
    <>
      <Head>
        <title>Classes - 13 Vaults</title>
      </Head>
      <CompendiumCategoryIndexLayout navigation={navigation}>
        <CompendiumTitle className="mt-2 mb-6">{t("title")}</CompendiumTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {map(
            localeContentLayerList<ClassItemListing>(
              localeString,
              defaultLocale,
              classItems
            ),
            (classItem) => (
              <CompendiumContentHero
                key={classItem.slug}
                title={classItem.name}
                description={
                  classItem.page_dress?.lead ? (
                    <p className="text-sm">{classItem.page_dress.lead}</p>
                  ) : null
                }
                detailsHref={`/${localeString}/compendium/classes/${classItem.slug}`}
                detailsLabel={t("class-details-button-label", {
                  class: classItem.name,
                })}
              >
                <ul>
                  <li>
                    <Trans
                      t={t}
                      i18nKey="damage-die-label"
                      values={{ die: classItem.best_damage_die }}
                      components={{ strong: <strong /> }}
                    />
                  </li>
                  <li>
                    <Trans
                      t={t}
                      i18nKey="recovery-die-label"
                      values={{ die: classItem.recovery_die }}
                      components={{ strong: <strong /> }}
                    />
                  </li>
                  {classItem.recoveries === 8 ? null : (
                    <li>
                      <Trans
                        t={t}
                        i18nKey="recoveries-label"
                        values={{ recoveries: classItem.recoveries }}
                        components={{ strong: <strong /> }}
                      />
                    </li>
                  )}
                  <li>
                    <Trans
                      t={t}
                      i18nKey="ability-scores-label"
                      values={{
                        abilityScores: listFormatter.format(
                          map(
                            map(
                              classItem.ability_scores,
                              (score) => score || ""
                            ),
                            (ability) => t(ability)
                          )
                        ),
                      }}
                      components={{ strong: <strong /> }}
                    />
                  </li>
                </ul>
              </CompendiumContentHero>
            )
          )}
        </div>
      </CompendiumCategoryIndexLayout>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: map(supportedLocales, (locale) => `/${locale}/compendium/classes/`),
    fallback: false,
  };
}

export async function getStaticProps(
  context: GetStaticPathsContext
): Promise<GetStaticPropsResult<ClassesPageP>> {
  return {
    props: {
      classItems: map(allClassItems, (classItem) =>
        pick(classItem, [
          "slug",
          "name",
          "ability_scores",
          "best_damage_die",
          "recoveries",
          "recovery_die",
          "page_dress",
          "locale",
        ])
      ),
      navigation: buildNav({
        locale: String(get(context, "params.locale", defaultLocale)),
        rulesDocuments: allRulesDocuments,
        classItems: allClassItems,
        ancestries: allAncestries,
      }),
      ...(await getI18nProperties(context, ["classes", "common"])),
    },
  };
}
