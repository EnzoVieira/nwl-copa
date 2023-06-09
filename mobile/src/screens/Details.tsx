import { useEffect, useState } from "react"
import { Share } from "react-native"
import { HStack, VStack, useToast } from "native-base"
import { useRoute } from "@react-navigation/native"

import { Header } from "../components/Header"
import { Loading } from "../components/Loading"
import { PoolCardProps } from "../components/PoolCard"
import { PoolHeader } from "../components/PoolHeader"
import { EmptyMyPoolList } from "../components/EmptyMyPoolList"
import { Option } from "../components/Option"
import { Guesses } from "../components/Guesses"

import { api } from "../services/api"

interface RouteParams {
  id: string
}

export function Details() {
  const [isLoading, setIsLoading] = useState(false)
  const [optionSelected, setOptionSelected] = useState<"GUESSES" | "RANKING">(
    "GUESSES"
  )
  const [poolDetails, setPoolDetails] = useState({} as PoolCardProps)

  const toast = useToast()
  const route = useRoute()
  const { id } = route.params as RouteParams

  async function fetchPoolDetails() {
    try {
      setIsLoading(true)

      const response = await api.get(`/pools/${id}`)

      setPoolDetails(response.data.pool)
    } catch (error) {
      console.log(error)

      toast.show({
        title: "Não foi possível carregar os detalhes do bolão",
        placement: "top",
        bgColor: "red.500",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCodeShare() {
    Share.share({
      message: poolDetails.code,
    })
  }

  useEffect(() => {
    fetchPoolDetails()
  }, [id])

  if (isLoading) {
    return <Loading />
  }

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header
        title={poolDetails.title}
        showBackButton
        showShareButton
        onShare={handleCodeShare}
      />

      {poolDetails._count?.participants > 0 ? (
        <VStack px={5} flex={1}>
          <PoolHeader data={poolDetails} />

          <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
            <Option
              title="Seus papites"
              isSelected={optionSelected === "GUESSES"}
              onPress={() => setOptionSelected("GUESSES")}
            />

            <Option
              title="Ranking do grupo"
              isSelected={optionSelected === "RANKING"}
              onPress={() => setOptionSelected("RANKING")}
            />
          </HStack>

          <Guesses poolId={poolDetails.id} code={poolDetails.code} />
        </VStack>
      ) : (
        <EmptyMyPoolList code={poolDetails.code} />
      )}
    </VStack>
  )
}
