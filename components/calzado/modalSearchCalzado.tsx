import { Barcode } from 'lucide-react-native'
import React, { useState } from 'react'
import tw from 'twrnc'
import { TouchableOpacity, View, Text, TextInput } from 'react-native'
import { Sheet } from 'tamagui'

const ModalSearchCalzado = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TouchableOpacity
        style={tw`w-10 h-10 bg-zinc-800 rounded-lg items-center justify-center`}
        onPress={() => setOpen(true)}
      >
        <Barcode size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Sheet
        modal
        open={open}
        onOpenChange={setOpen}
        snapPoints={[60]}
        position={0}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame>
          <Sheet.Handle />
          
          <View style={tw`p-4 flex-1`}>
            {/* Header */}
            <View style={tw`flex-row justify-between items-center mb-4`}>
              <Text style={tw`text-xl font-bold text-white`}>
                Buscar Calzado
              </Text>
              <TouchableOpacity
                style={tw`w-10 h-10 rounded-full bg-gray-100 items-center justify-center`}
                onPress={() => setOpen(false)}
              >
                <Barcode size={20} style={tw`text-black`} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={tw`flex-1`}>
              <TextInput
                style={tw`w-full h-12 px-4 border border-gray-300 rounded-lg bg-white`}
                placeholder="Ingrese código de calzado"
              />
            </View>

            {/* Footer if needed */}
            <View style={tw`mt-4`}>
              {/* Puedes agregar botones o contenido adicional aquí */}
            </View>
          </View>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}

export default ModalSearchCalzado