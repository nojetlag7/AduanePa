import Image, { type StaticImageData } from "next/image"
import angwamoo from "@/public/landing_page_meals/angwamoo.webp"
import bofrot from "@/public/landing_page_meals/bofrot.webp"
import boiledPlantain from "@/public/landing_page_meals/boiled_plantain.webp"
import chickenSalad from "@/public/landing_page_meals/chicken_salad.webp"
import englishBreakfast from "@/public/landing_page_meals/english_breakfast.webp"
import jollofAndSalad from "@/public/landing_page_meals/jollof_and_salad.webp"
import redRed from "@/public/landing_page_meals/red_red.webp"
import riceAndBroccoli from "@/public/landing_page_meals/rice_and_broccili.webp"
import waakye from "@/public/landing_page_meals/waakye.webp"
import { cn } from "@/lib/utils"

type FloatMeal = {
  src: StaticImageData
  label: string
  className: string
  delay: string
  duration: string
  /** Hidden below `sm` breakpoint */
  mobileHidden?: boolean
}

const HERO_MEALS: FloatMeal[] = [
  {
    src: waakye,
    label: "Waakye",
    className: "left-[-3%] top-[8%] h-20 w-20 sm:left-[2%] sm:top-[6%] sm:h-28 sm:w-28 lg:h-36 lg:w-36",
    delay: "0s",
    duration: "5.5s",
  },
  {
    src: jollofAndSalad,
    label: "Jollof and salad",
    className:
      "right-[-2%] top-[4%] h-16 w-16 sm:right-[4%] sm:top-[10%] sm:h-24 sm:w-24 lg:h-32 lg:w-32",
    delay: "1.2s",
    duration: "6s",
    mobileHidden: true,
  },
  {
    src: redRed,
    label: "Red red",
    className:
      "bottom-[18%] left-[-4%] h-16 w-16 sm:bottom-[22%] sm:left-[1%] sm:h-24 sm:w-24 lg:bottom-[20%] lg:h-32 lg:w-32",
    delay: "0.6s",
    duration: "5s",
  },
  {
    src: angwamoo,
    label: "Angwamoo",
    className:
      "right-[-5%] bottom-[12%] h-20 w-20 sm:right-[0%] sm:bottom-[16%] sm:h-28 sm:w-28 lg:right-[2%] lg:h-36 lg:w-36",
    delay: "2s",
    duration: "6.5s",
  },
  {
    src: bofrot,
    label: "Bofrot",
    className:
      "top-[42%] left-[6%] h-14 w-14 opacity-80 sm:left-[8%] sm:h-20 sm:w-20 lg:h-24 lg:w-24",
    delay: "1.8s",
    duration: "4.8s",
    mobileHidden: true,
  },
  {
    src: boiledPlantain,
    label: "Boiled plantain",
    className:
      "top-[30%] right-[8%] h-14 w-14 opacity-75 sm:right-[12%] sm:h-20 sm:w-20 lg:h-28 lg:w-28",
    delay: "0.9s",
    duration: "5.8s",
    mobileHidden: true,
  },
]

const FEATURES_MEALS: FloatMeal[] = [
  {
    src: chickenSalad,
    label: "Chicken salad",
    className:
      "left-[-2%] top-[12%] h-16 w-16 sm:left-[3%] sm:top-[8%] sm:h-24 sm:w-24 lg:h-28 lg:w-28",
    delay: "0.4s",
    duration: "5.2s",
  },
  {
    src: riceAndBroccoli,
    label: "Rice and broccoli",
    className:
      "right-[-3%] top-[6%] h-14 w-14 sm:right-[2%] sm:h-20 sm:w-20 lg:h-28 lg:w-28",
    delay: "1.5s",
    duration: "6.2s",
    mobileHidden: true,
  },
  {
    src: englishBreakfast,
    label: "English breakfast",
    className:
      "bottom-[8%] left-[4%] h-14 w-14 opacity-80 sm:left-[6%] sm:h-20 sm:w-20 lg:h-24 lg:w-24",
    delay: "2.2s",
    duration: "5.6s",
    mobileHidden: true,
  },
  {
    src: bofrot,
    label: "Bofrot (features)",
    className:
      "right-[5%] bottom-[10%] h-16 w-16 sm:right-[8%] sm:bottom-[14%] sm:h-24 sm:w-24",
    delay: "0.8s",
    duration: "4.9s",
  },
]

function FloatingMeal({ meal }: { meal: FloatMeal }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-landing-float absolute overflow-hidden rounded-full",
        "border-[3px] border-white/90 shadow-lg shadow-primary/15",
        "ring-2 ring-primary/10 dark:border-white/15 dark:ring-primary/20",
        meal.mobileHidden && "hidden sm:block",
        meal.className
      )}
      style={{
        animationDelay: meal.delay,
        animationDuration: meal.duration,
      }}
    >
      <Image
        src={meal.src}
        alt=""
        fill
        quality={75}
        sizes="(max-width: 640px) 80px, 144px"
        className="object-cover"
      />
    </div>
  )
}

export function HeroFloatingMeals() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {HERO_MEALS.map((meal) => (
        <FloatingMeal key={`hero-${meal.label}`} meal={meal} />
      ))}
    </div>
  )
}

export function FeaturesFloatingMeals() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
      {FEATURES_MEALS.map((meal) => (
        <FloatingMeal key={`features-${meal.label}`} meal={meal} />
      ))}
    </div>
  )
}
