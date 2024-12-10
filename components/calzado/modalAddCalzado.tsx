import { Plus } from 'lucide-react-native'
import React from 'react'
import tw from 'twrnc'
import { TouchableOpacity } from 'react-native'

const ModalAddCalzado = ({}) => {
  return (
    <>
        <TouchableOpacity 
        onPress={() => {}}
        style={tw`w-10 h-10 bg-emerald-800 rounded-lg items-center justify-center`}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
    </>
  )
}

export default ModalAddCalzado