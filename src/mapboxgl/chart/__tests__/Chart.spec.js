import { mount, config } from '@vue/test-utils';
import SmWebMap from '../../web-map/WebMap.vue';
import SmChart from '../Chart.vue';
import mapEvent from '@types_mapboxgl/map-event';
config.stubs.transition = false
jest.mock('@libs/mapboxgl/mapbox-gl-enhance.js', () => require('@mocks/mapboxgl').mapboxgl);
jest.mock('@libs/iclient-mapboxgl/iclient10-mapboxgl.min.js', () => require('@mocks/mapboxgl_iclient'));


describe('Chart', () => {

    let wrapper;
    let mapWrapper;
    let iportalDataSet = {
        type: "iPortal", //iServer iPortal
        url: "http://support.supermap.com.cn:8092/web/datas/1920557079",
        queryInfo: {
            maxFeatures: 20
        }
    };

    beforeEach(() => {
        mapEvent.firstMapTarget = null;
        mapEvent.$options.mapCache = {};
        mapEvent.$options.webMapCache = {};
        wrapper = null;
        mapWrapper = null;
        mapWrapper = mount(SmWebMap,
            {
                propsData: {
                    serverUrl: 'http://support.supermap.com.cn:8092/',
                    mapId: '1649097980'
                }
            });

    })

    afterEach(() => {
        if (wrapper) {
            wrapper.destroy();
        }
        if (mapWrapper) {
            mapWrapper.destroy();
        }
    })

    it('bar', (done) => {

        wrapper = mount(SmChart, {
            propsData: {
                mapTarget: "map",
                dataset: iportalDataSet,
                options: {
                    legend: { data: ['2016起降架次（架次）', '2017起降架次（架次）'] }, //与yField数据一致
                    tooltip: { formatter: "{b0}: {c0}" },
                    grid: {
                        top: 30,
                        bottom: 60,
                        left: 60,
                        right: 30
                    }
                },
                style: {
                    position: "absolute",
                    bottom: "10px",
                    right: "10px"
                },
                datasetOptions: [
                    {
                        seriesType: "bar", //图表类型
                        isStastic: true, //是否统计, 默认不统计
                        isStack: true, //是否堆叠, 默认不堆叠
                        xField: "机场", //x坐标轴数据字段
                        yField: "2016起降架次（架次）" //统计的数据，legned默认名字
                    },
                    {
                        seriesType: "bar",

                        isStastic: true,
                        isStack: true,
                        xField: "机场",
                        yField: "2017起降架次（架次）",
                    }
                ]
            }
        });
        wrapper.vm.$on("rendered", () => {
            expect(wrapper.find("div#smchart-1").exists()).toBe(true);
            expect(wrapper.vm.$el.outerHTML).toContain("canvas");
            expect(wrapper.vm.options.xAxis.data.length).toBe(2);
            expect(wrapper.vm.options.legend.data[0]).toBe("2016起降架次（架次）");
            expect(wrapper.vm.options.legend.data[1]).toBe("2017起降架次（架次）");
            done();
        })
    });

    it('scatter', (done) => {

        wrapper = mount(SmChart, {
            propsData: {
                mapTarget: "map",
                dataset: iportalDataSet,
                // datasets: {
                //     type: "iServer",
                //     url: "http://support.supermap.com.cn:8090/iserver/services/data-jingjin/rest/data/datasources/Jingjin/datasets/Landuse_R",
                //     queryInfo: { attributeFilter: "SmID > 0" }
                // },
                options: {
                    legend: { data: ['同比增速%'] },//与yField数据一致
                    tooltip: { formatter: "{b0}: {c0}" },
                },
                style: {
                    position: "absolute",
                    bottom: "10px",
                    right: "10px"
                },
                datasetOptions: [
                    {
                        seriesType: "scatter", //图表类型
                        isStastic: true, //是否统计, 默认不统计
                        isStack: false, //是否堆叠, 默认不堆叠
                        xField: "机场", //x坐标轴数据字段
                        yField: "同比增速%" //统计的数据，legned默认名字
                    }
                ]
            }
        });
        wrapper.vm.$on("rendered", () => {
            expect(wrapper.find("div#smchart-2").exists()).toBe(true);
            expect(wrapper.vm.$el.outerHTML).toContain("canvas");
            expect(wrapper.vm.options.xAxis.data.length).toBe(2);
            expect(wrapper.vm.options.legend.data[0]).toBe("同比增速%");
            done();
        })
    });

    it('line', (done) => {

        wrapper = mount(SmChart, {
            propsData: {
                mapTarget: "map",
                dataset: iportalDataSet,
                options: {
                    legend: { data: ['2016旅客吞吐量（人次）', '2017旅客吞吐量（人次）'] }, //与yField数据一致
                    tooltip: { formatter: "{b0}: {c0}" },
                    grid: {
                        top: 30,
                        bottom: 60,
                        left: 60,
                        right: 30
                    }
                },
                style: {
                    position: "absolute",
                    bottom: "10px",
                    right: "10px"
                },
                datasetOptions: [
                    {
                        seriesType: "line", //图表类型
                        isStastic: true, //是否统计, 默认不统计
                        isStack: true, //是否堆叠, 默认不堆叠
                        xField: "机场", //x坐标轴数据字段
                        yField: "2016旅客吞吐量（人次）" //统计的数据，legned默认名字
                    },
                    {
                        seriesType: "line",
                        isStastic: true,
                        isStack: true,
                        xField: "机场",
                        yField: "2017旅客吞吐量（人次）"
                    }
                ]
            }
        });
        wrapper.vm.$on("rendered", () => {
            expect(wrapper.find("div#smchart-3").exists()).toBe(true);
            expect(wrapper.vm.$el.outerHTML).toContain("canvas");
            expect(wrapper.vm.options.xAxis.data.length).toBe(2);
            expect(wrapper.vm.options.legend.data[0]).toBe("2016旅客吞吐量（人次）");
            expect(wrapper.vm.options.legend.data[1]).toBe("2017旅客吞吐量（人次）");
            done();
        })
    });

})