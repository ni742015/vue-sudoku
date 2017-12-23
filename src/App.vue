<template>
    <div id="sudoku">
        <transition appear name="bounce">
            <div class="title">
                <img src="./assets/title.png"/>
            </div>
        </transition>
        <div class="grid-box">
            <div ref="row" class="row clearfix" v-for="(row,rowIndex) in gridList">
                <div ref="grid" v-for="(grid,gridIndex) in row" class="grid"
                     :class="{'border-bottom':rowIndex && ((rowIndex+1) % 3 === 0),
                     'border-right':gridIndex && ((gridIndex+1) % 3 === 0),
                     'available':grid.isAvailable,
                     'wrong':grid.isWrong,
                     'useable':dragging && grid.isAvailable}"
                >
                    {{grid.isAvailable ? grid.userText : grid.text}}
                </div>
            </div>

        </div>

        <div class="base-data-wrapper">
            <div class="base-data" draggable="true"
                 @touchstart="touchStart"
                 @touchmove.prevent="touchMove"
                 @touchend="touchEnd"
                 v-for="data in level.baseDataList">{{data}}
            </div>
        </div>

        <div class="btn-group">
            <button @click="restart()">重填</button>
            <button @click="valid()">验证</button>
            <button @click="init()">新游戏</button>
        </div>

        <div class="drag-block" :style="dragStyle" v-show="dragging">{{choesdData}}</div>
    </div>
</template>

<script>
    import {GridList} from "./class"
    import {levelList, gridData} from "./data"
    import common from "./common"


    export default {
        name: 'app',
        created(){
            this.hoverEleBefore = null;//上一个手指滑动经过的对象
            this.init();
        },
        data () {
            return {
                GridList: {},
                gridList: [],
                choesdData: "",
                dragging: false,
                dragStyle: {top: 0, left: 0},
                levelList: levelList,
                levelIndex: 0
            }
        },
        computed: {
            level(){
                return this.levelList[this.levelIndex];
            },
            dataType(){
                return this.level.dateType;
            }
        },
        methods: {
            init(){
                this.GridList = new GridList(this.level.baseDataList);
                let gridList = this.GridList.init();
                if (!gridList) {
                    gridList = this.GridList.initGridList(gridData[common.getRandom(gridData.length)]);
//                    console.warn(gridList)
                }
                this.gridList = gridList;
                this._hideSomeGridData();
            },

            _hideSomeGridData(){
                for (let i = 0; i < 9; i++) {
                    let rowList = [];
                    let hideCount = common.getRandom(...this.level.hideGridRange);
                    console.log("hideCount", hideCount);
                    for (let j = 0; j < hideCount; j++) {
                        let unAvailableList = this.gridList[i].filter((item, index) => {
                            return !item.isAvailable;

                        });
                        unAvailableList[common.getRandom(unAvailableList.length)].isAvailable = true;

                    }
                    this.gridList.push(rowList);
                }
            },

            _each(cb){
                for (let i = 0; i < this.gridList.length; i++) {
                    for (let j = 0; j < this.gridList[i].length; j++) {
                        let item = this.gridList[i][j];
                        cb && cb(item, i, j);
                    }
                }
            },

            restart(){
                this._each(item => {
                    console.log(item)
                    if (item.isAvailable) {
                        item.userText = "";
                        item.isWrong = false;

                    }
                });

            },

            valid(){
                let flag;
                this._each((item, i, j) => {
                    let validData = this.GridList.getValidData(i, j).data;
                    if (item.isAvailable) {
                        if (item.userText != validData) {
                            item.isWrong = true;
                            flag = true;
                        } else {
                            item.isWrong = false;

                        }
                    }

                });

                if (flag) {
                    alert("填写错误")
                } else {
                    alert("填写正确")
                }
            },

            touchStart(ev){
                console.log(ev);
                this.choesdData = ev.target.innerText;
                this.dragStyle.left = ev.target.offsetLeft + "px";
                this.dragStyle.top = ev.target.offsetTop + "px";
                this.dragging = true;

            },

            touchMove(ev){
                this.dragStyle.top = ev.touches[0].clientY - 40 + "px";
                this.dragStyle.left = ev.touches[0].clientX + "px";
                this.dragging = true;

                let hoverEle = document.elementFromPoint(ev.touches[0].clientX, ev.touches[0].clientY);
                console.log(hoverEle.className);


                if (this.hoverEleBefore && this.hoverEleBefore !== hoverEle) {
                    this.hoverEleBefore.removeAttribute("style");
                }


                if (hoverEle.className.indexOf('grid') >= 0 && hoverEle.className.indexOf('available') >= 0) {
                    hoverEle.style.backgroundColor = "#ccc";
                    this.hoverEleBefore = hoverEle;

                }

//                console.log(hoverEle)
            },

            touchEnd(ev){
                console.log(this.hoverEleBefore);

                if (this.hoverEleBefore) {
                    this.hoverEleBefore.removeAttribute("style");

                    let row = this._getChildrenIndex(this.hoverEleBefore.parentNode);
                    let col = this._getChildrenIndex(this.hoverEleBefore);
                    console.log(row, col);

                    this.gridList[row][col].userText = this.choesdData;
                }

                this.dragging = false;

            },


            _getChildrenIndex(ele){
                let nodeList = ele.parentNode.children;
                for (let i = 0; i < nodeList.length; i++) {
                    if (nodeList[i] === ele) {
                        return i;
                    }
                }

            }
        }
    }
</script>

<style lang="scss">
    $theme-color: #ccc;
    @mixin grid() {
        width: 30px;
        height: 30px;
        line-height: 30px;
        border: 1px solid $theme-color;
        box-sizing: border-box;
        text-align: center;
        vertical-align: middle;
    };

    * {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .clearfix:after {
        visibility: hidden;
        display: block;
        font-size: 0;
        content: " ";
        clear: both;
        height: 0;
    }

    .clearfix {
        *zoom: 1;
    }

    .drag-block {
        position: absolute;
        z-index: 100;
        opacity: .7;
        @include grid;

    }

    .grid-list-move {
        transition: transform 1s;
    }

    .bounce-enter-active {
        animation: bounce-in .5s;
    }
    .bounce-leave-active {
        animation: bounce-in .5s reverse;
    }
    @keyframes bounce-in {
        0% {
            transform: scale(0);
        }
        50% {
            transform: scale(1.5);
        }
        100% {
            transform: scale(1);
        }
    }

    #sudoku {
        margin-top: 30px;
        .title {
            text-align: center;
            margin-bottom: 20px;

            img {
                width: 40%;
            }
        }
        .grid-box {
            border-top: 2px solid $theme-color;
            border-left: 2px solid $theme-color;
            width: 270px;
            margin: auto;
            .row {
                .border-bottom {
                    border-bottom: 2px solid $theme-color;
                }
                .border-right {
                    border-right: 2px solid $theme-color;
                }
            }

            .grid {
                float: left;
                @include grid;
                box-sizing: border-box;
                border-left: 0;
                border-top: 0;
                text-align: center;
                &.available {
                    background-color: #f3f3f3;
                }
                &.useable {
                    background-color: greenyellow;
                    &:hover, &:active {
                        background-color: #cccccc;

                    }
                }
                &.wrong {
                    background-color: pink;

                }
                &:active {
                    background-color: #cccccc;

                }

            }

        }

        .base-data-wrapper {
            margin: 15px;
            display: flex;
            justify-content: center;
            .base-data {
                display: inline-block;
                margin: 0 2px;
                @include grid;

            }
        }

        .btn-group {
            margin: 20px;
            display: flex;
            justify-content: center;

            button {
                border: 1px solid $theme-color;
                border-radius: 5px;
                padding: 3px 8px;
                min-width: 80px;
                background-color: #ffffff;
                margin: 0 5px;
            }
        }
    }


</style>
