import HeroSection from '../components/home/HeroSection'
import ServicesSection from '../components/home/ServicesSection'
import FeaturedElectricians from '../components/home/FeaturedElectricians'
import TrustBanner from '../components/home/TrustBanner'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesSection />
      <FeaturedElectricians />
      <TrustBanner />
    </>
  )
}
