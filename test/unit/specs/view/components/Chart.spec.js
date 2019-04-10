import { mount, createLocalVue } from '@vue/test-utils';
import SmMap from '@/view/components/Map';
import SmChart from '@/view/components/Chart.vue';
import mapEvent from '@/view/commontypes/mapEvent';
import { config } from '@vue/test-utils';
import ElementUI from 'element-ui'
import echarts from "echarts";
config.stubs.transition = false
const localVue = createLocalVue()
localVue.use(ElementUI)
jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@libs/iclient-mapboxgl/iclient9-mapboxgl.min.js', () => require('@mocks/mapboxgl_iclient'));

describe('Chart', () => {

    let wrapper;
    let mapWrapper;
    let spy;

    beforeEach(() => {
        mapEvent.firstMapTarget = null;
        mapEvent.$options.mapCache = {};
        mapEvent.$options.webMapCache = {};
        wrapper = null;
        mapWrapper = null;


        spy = jest.spyOn(echarts, 'init').mockImplementation(() => {
            return {
                setOption: (options) => {
                    echarts.option = options
                }
            }
        })
    })

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
        if (mapWrapper) {
            mapWrapper.destroy();
        }
        echarts.actualOptions = null;
        spy.mockRestore()
    })

    it('iserver data', (done) => {
        mapWrapper = mount(SmMap);
        wrapper = mount(SmChart, {
            localVue,
            propsData: {
                mapTarget: "map",
                datasets: {
                    type: "iServer",
                    url: "http://support.supermap.com.cn:8090/iserver/services/data-jingjin/rest/data/datasources/Jingjin/datasets/Landuse_R",
                    queryInfo: { attributeFilter: "SmID > 0" }
                },
                chartOptions: {
                    xFieldStatistical: true,
                    xAxisLabelRotate: true,
                    yAxisLabelRotate: true,
                    legendPosition: "top",
                    xAxisName: "",
                    yAxisName: "",
                    xAxis: "LANDTYPE",
                    yAxis: ["AREA", "AREA_1"]
                }
            }
        });
        wrapper.vm.viewModel.on("chartinitsucceeded", () => {
            expect(wrapper.vm.getMapTarget).toBe('map');
            expect(wrapper.find("div#chart").exists()).toBe(true);
            expect(spy).toHaveBeenCalled();
            expect(echarts.option.series.length).toBe(2);
            expect(echarts.option.xAxis.data.length).toBe(2);
            expect(echarts.option.yAxis).toEqual(expect.anything());
            done();
        })
    });

    it('iportal data', (done) => {
        mapWrapper = mount(SmMap);
        wrapper = mount(SmChart, {
            localVue,
            propsData: {
                mapTarget: "map",
                datasets: {
                    type: "iPortal",
                    url: "http://support.supermap.com.cn:8092/web/datas/888186112",
                    queryInfo: { attributeFilter: "SmID > 0" }
                },
                chartOptions: {
                    xFieldStatistical: true,
                    xAxisLabelRotate: true,
                    yAxisLabelRotate: true,
                    legendPosition: "top",
                    xAxisName: "",
                    yAxisName: "",
                    xAxis: "LANDTYPE",
                    yAxis: ["AREA", "AREA_1"]
                }
            }
        });
        wrapper.vm.viewModel.on("chartinitsucceeded", () => {
            expect(wrapper.element).toMatchSnapshot();
            expect(wrapper.vm.getMapTarget).toBe('map');
            expect(wrapper.find("div#chart").exists()).toBe(true);
            expect(spy).toHaveBeenCalled();
            expect(echarts.option.series.length).toBe(2);
            expect(echarts.option.xAxis.data.length).toBe(3);
            expect(echarts.option.yAxis).toEqual(expect.anything());
            done();
        })
    });


})