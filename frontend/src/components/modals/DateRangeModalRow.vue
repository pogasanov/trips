<template>
    <tr
        class="hover:bg-purple-700 hover:text-white cursor-pointer"
        :class="{'bg-purple-700': selected}"
    >
        <td class="border px-4 py-2">{{ item.incoming_doc_type }}</td>
        <td class="border px-4 py-2">{{ item.incoming_doc_date }}</td>
        <td class="border px-4 py-2">{{ item.invoice_number }}</td>
        <td class="border px-4 py-2">{{ item.invoice_date }}</td>
        <td class="border px-4 py-2">{{ partnerName }}</td>
        <td class="border px-4 py-2">{{ item.content }}</td>
        <td class="border px-4 py-2">{{ item.quantity }}</td>
        <td class="border px-4 py-2">{{ item.price }}</td>
        <td class="border px-4 py-2">{{ item.total }}</td>
        <td class="border px-4 py-2">{{ item.vat_rate }}</td>
        <td class="border px-4 py-2">{{ item.vat_total }}</td>
    </tr>
</template>

<script lang="ts">
import {computed, defineComponent, PropType} from "vue";
import {AdvanceItem, Option} from "@/types";
import {useStore} from "vuex";

export default defineComponent({
    name: 'DateRangeModalRow',
    props: {
        item: {
            type: Object as PropType<AdvanceItem>,
            required: true,
        },
        selected: {
            type: Boolean,
            required: true,
        }
    },
    setup(props) {
        const $store = useStore()
        const partnerName = computed(() => {
            const partner = $store.state.bootstrap.partners.find((partner: Option) => partner.uuid === props.item.partner_uuid)
            if (!partner) {
                return ''
            }
            return partner.name
        })

        return {
            partnerName,
        }
    }
})
</script>