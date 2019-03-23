import mapEvent from '../commontypes/mapEvent'

export default {
    props:{
        background:{
            type:String,
            default:"#fff"
        },
        textColor:{
            type:String,
            default:'#333'
        }
    },
    data() {
        return {
            themeStyle:{
                background:this.background,
                textColor:this.textColor,
                colorGroup:['#3fb1e3','#6be6c1','#626c91','#a0a7e6','#c4ebad','#96dee8']
            }
        }
    },
    mounted() {
        mapEvent.$on('change-theme', (themeStyle) => {
            this.themeStyle = Object.assign(this.themeStyle, themeStyle)
        })
    },
    computed:{
        getBackgroundStyle(){
            return {background:this.themeStyle['background']}
        },
        getTextColorStyle(){
            return {color:this.themeStyle['textColor']}
        },
        getBackground(){
            return this.themeStyle['background']
        },
        getTextColor(){
            return this.themeStyle['textColor']
        }
       
    },
    methods:{
        getColorStyle(index){
            return {color:this.themeStyle.colorGroup[index]}
        },
        getColor(index){
            return this.themeStyle.colorGroup[index]
        }
    }
}