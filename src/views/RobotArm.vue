<script setup>
import { ref, onMounted, computed } from 'vue'
import Two from 'two.js'
import { gsap } from 'gsap'

/*
*
*  開發思維： 資料備妥，並於每個操作後進行更新
*
*
* */

const IS_DEMO_SINGLE_ACTION = ref(true)
const timeline = computed(() => {
  return gsap.timeline({ repeat: IS_DEMO_SINGLE_ACTION.value ? 0 : 24 })
})

onMounted(() => {
  initTwoInstance()

  drawRobotArm()
  drawBoxes()
})

const learningGoalList = ref([
  {
    goal: '使用 Two.js 繪製一個長方形，並透過 gsap.js 進行動畫控制(水平垂直轉向、移動)',
    checked: true
  },
  {
    goal: '繪製兩個長方形盒子（提取盒、放置盒），盒中物品依據資料顯示物品位置狀態',
    checked: true
  },
  {
    goal: '提取物品時，提取盒子內容物-1 、放置盒子內容物+1，直到完全放置完畢',
    checked: true
  },
  {
    goal: '提取物品時，手臂上需要有物品圖示(圓形); 放置物品時，手臂上物品圖示(圓形)需要消失',
    checked: false
  },
  {
    goal: '撰寫指令(Commands)，透過指令控制機械手臂的動作(提取物品、轉向、放置物品、回到定位)',
    checked: false
  },
  {
    goal: '以資料方式渲染佈局(layout)：機械手臂、提取盒子、放置盒子',
    checked: false
  },
])

const twoInstance = ref(null)
const renderContainer = ref(null)
const extractBox = ref([
  ...Array.from({ length: 25 }, (_, index) => ({
    id: `item-${index + 1}`,
    itemName: `item-${index + 1}`,
    location: 'extractBox'
  }))
])
const placeBox = ref([])
const tempBox = ref([])

function initTwoInstance() {
  const params = {
    type: Two.Types.svg,
    autostart: true,
    fullscreen: false, // When the fullscreen parameter is set to true Two.js automatically makes the position: fixed and does overflow: hidden on the body.
    width: '100%',
    height: '100%'
  }

  twoInstance.value = new Two(params).appendTo(renderContainer.value)
}


function resetTwoInstance() {
  twoInstance.value.clear()
  twoInstance.value.update()
}

function getPositions(angel, distance) {
  const radian = angel * (Math.PI / 180)
  const x = distance * Math.cos(radian)
  const y = distance * Math.sin(radian)

  return { x, y }
}

function drawRobotArm() {
  // 計算方式：(畫布寬度 + 長方形寬度) / 2 - 長方形寬度 / 2
  const { width: renderContainerWidth, height: renderContainerHeight } = renderContainer.value.getBoundingClientRect()
  const rectCenterX = (renderContainerWidth + 150) / 2 - 75
  const rectCenterY = (renderContainerHeight + 10) / 2 - 5

  const rect = twoInstance.value.makeRectangle(rectCenterX, rectCenterY, 150, 10)
  rect.id = 'arm'
  rect.fill = 'rgba(0, 200, 255, 0.75)'
  rect.stroke = 'rgba(0, 200, 255, 1)'
  rect.linewidth = 2

  const circleCenterX = rectCenterX  - 75
  const circleCenterY = rectCenterY
  const r = 20
  const circle = twoInstance.value.makeCircle(circleCenterX, circleCenterY, r)
  circle.id = 'circle-1'
  circle.fill = 'none'
  circle.stroke = 'none'
  circle.lineWidth = 0

  const text = twoInstance.value.makeText('', circleCenterX, circleCenterY )
  text.size = 16
  text.id = 'text-1'
  text.stroke = 'yellow'
  text.fill = 'yellow'
  text.size = 20
  // text.noStroke()
  // text.noFill()

  // group.fill = "yellow"
  // group.id = 'group-2'
  // group.stroke = 'rgba(0, 200, 255, 1)'
  // group.linewidth = 2

  twoInstance.value.update()
}


function rotateRect(direction) {
  const arm = twoInstance.value.scene.getById('arm')
  const circle = twoInstance.value.scene.getById('circle-1')
  const text = twoInstance.value.scene.getById('text-1')

  switch (direction) {
    case 'vertical':
      timeline.value.to(arm, {
        duration: 0.3,
        rotation: -Math.PI / 2,
        repeat: 0,
        yoyo: true,
        ease: 'power1.inOut',
        // 圓形依據手臂位置移動弧度，換算對應的角度後，在取得對應的 x, y 座標
        onUpdate: () => {
          const deg = -(180 - arm.rotation * 180 / Math.PI)

          const { x, y } = getPositions(deg, 75)
          circle.translation.set(x + arm.translation.x, y + arm.translation.y)

          text.translation.set(x + arm.translation.x, y + arm.translation.y)
          text.value = tempBox.value.length === 0 ? '' : tempBox.value[0].itemName
        },
        onComplete: () => {}
      })
      break
    case 'horizontal':
      timeline.value.to(arm, {
        duration: 0.3,
        rotation: 0,
        repeat: 0,
        yoyo: true,
        ease: 'power1.inOut',
        // 圓形依據手臂位置移動弧度，換算對應的角度後，在取得對應的 x, y 座標
        onUpdate: () => {
          const deg = -(180 - arm.rotation * 180 / Math.PI)

          const { x, y } = getPositions(deg, 75)
          circle.translation.set(x + arm.translation.x, y + arm.translation.y)

          text.translation.set(x + arm.translation.x, y + arm.translation.y)
          text.value = tempBox.value.length === 0 ? '' : tempBox.value[0].itemName
        },
        onComplete: () => {}
      })
      break
  }
}

function moveRect(direction) {
  const { width: renderContainerWidth, height: renderContainerHeight } = renderContainer.value.getBoundingClientRect()
  const rectCenterX = (renderContainerWidth + 150) / 2 - 75
  const rectCenterY = (renderContainerHeight + 10) / 2 - 5

  const arm = twoInstance.value.scene.getById('arm')
  const circle = twoInstance.value.scene.getById('circle-1')
  const text = twoInstance.value.scene.getById('text-1')

  switch (direction) {
    case 'vertical':
      timeline.value.to(arm.translation, {
        duration: 0.3,
        y: rectCenterY + 100,
        repeat: 0,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => {
          if (IS_DEMO_SINGLE_ACTION.value) return
          extractItem()

          if (tempBox.value.length === 0) return

          const deg = -(180 - arm.rotation * 180 / Math.PI)

          const { x, y } = getPositions(deg, 75)
          circle.translation.set(x + arm.translation.x, y + arm.translation.y)
          circle.fill = 'red'

          text.stroke = 'yellow'
          text.fill = 'yellow'
          text.value = tempBox.value[0]?.itemName || ''
          console.log('text.value', text.value)
        },
        // 圓形依據手臂位置移動弧度，換算對應的角度後，在取得對應的 x, y 座標
        onUpdate: () => {},
      })
      timeline.value.to(arm.translation, {
        duration: 0.3,
        y: rectCenterY,
        repeat: 0,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => {},
        // 圓形依據手臂位置移動弧度，換算對應的角度後，在取得對應的 x, y 座標
        onUpdate: () => {

          const deg = -(180 - arm.rotation * 180 / Math.PI)

          const { x, y } = getPositions(deg, 75)
          circle.translation.set(x + arm.translation.x, y + arm.translation.y)

          text.translation.set(x + arm.translation.x, y + arm.translation.y)
        },
      })

      break
    case 'horizontal':
      timeline.value.to(arm.translation, {
        duration: 0.3,
        x: rectCenterX - 100,
        repeat: 0,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => {
          if (IS_DEMO_SINGLE_ACTION.value) return
          placeItem()

          if (tempBox.value.length !== 0) return
          circle.fill = 'none'
          text.noStroke()
          text.noFill()
        },
        // 圓形依據手臂位置移動弧度，換算對應的角度後，在取得對應的 x, y 座標
        onUpdate: () => {

          const deg = -(180 - arm.rotation * 180 / Math.PI)

          const { x, y } = getPositions(deg, 75)
          circle.translation.set(x + arm.translation.x, y + arm.translation.y)

          text.translation.set(x + arm.translation.x, y + arm.translation.y)
        }
      })

      timeline.value.to(arm.translation, {
        duration: 0.3,
        x: rectCenterX,
        repeat: 0,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => {},
        // 圓形依據手臂位置移動弧度，換算對應的角度後，在取得對應的 x, y 座標
        onUpdate: () => {
          const deg = -(180 - arm.rotation * 180 / Math.PI)

          const { x, y } = getPositions(deg, 75)
          circle.translation.set(x + arm.translation.x, y + arm.translation.y)
        }
      })

      break
  }
}

function drawBoxes() {
  drawExtractBox()
  drawPlaceBox()
}

function drawExtractBox() {
  const { width: renderContainerWidth, height: renderContainerHeight } = renderContainer.value.getBoundingClientRect()
  const groupAreaWidth = 100
  const groupAreaHeight = 100
  const centerRectX = (renderContainerWidth + groupAreaWidth) / 2 - (groupAreaWidth / 2)
  const centerRectY = (renderContainerHeight) - (groupAreaHeight / 2)

  twoInstance.value.makeRectangle(centerRectX, centerRectY, groupAreaWidth, groupAreaHeight)

  /*
  * x: 座標按照規律每 5 個循環一次(需要取餘數)
  * y: 座標每 5 個增加一次(需要無條件捨去)
  *
  * */

  const unitCellWidth = groupAreaWidth / 5
  const unitCellHeight = groupAreaHeight / 5
  const rects = []

  for(let i = 0; i < 25; i++) {
    const x = (i % 5) * unitCellWidth
    const y = Math.floor(i / 5) * unitCellHeight

    const unitCellCenterX = (centerRectX + x + unitCellWidth / 2) - groupAreaWidth / 2
    const unitCellCenterY = (centerRectY + y + unitCellHeight / 2) - groupAreaHeight / 2
    const rect = twoInstance.value.makeRectangle(unitCellCenterX, unitCellCenterY, unitCellWidth, unitCellHeight)

    rect.fill = 'white'
    rect.linewidth = 1
    rect.stroke = 'black'
    rect.id = `item-${i+1}`

    if (extractBox.value.some(item => item.id === rect.id && item.location === 'extractBox')) {
      rect.fill = 'blue'
    }

    rects.push(rect)
  }

  const group = twoInstance.value.makeGroup(rects)
  group.id = 'group-1'

  twoInstance.value.update()
}


function drawPlaceBox() {
  const { width: renderContainerWidth, height: renderContainerHeight } = renderContainer.value.getBoundingClientRect()
  const groupAreaWidth = 100
  const groupAreaHeight = 100
  const centerRectX = groupAreaWidth / 2
  const centerRectY = (renderContainerHeight + groupAreaHeight) / 2 - (groupAreaHeight / 2)

  twoInstance.value.makeRectangle(centerRectX, centerRectY, groupAreaWidth, groupAreaHeight)

  /*
  * x: 座標按照規律每 5 個循環一次(需要取餘數)
  * y: 座標每 5 個增加一次(需要無條件捨去)
  *
  * */

  const unitCellWidth = groupAreaWidth / 5
  const unitCellHeight = groupAreaHeight / 5
  const rects = []

  for(let i = 0; i < 25; i++) {
    const x = (i % 5) * unitCellWidth
    const y = Math.floor(i / 5) * unitCellHeight

    const unitCellCenterX = (centerRectX + x + unitCellWidth / 2) - groupAreaWidth / 2
    const unitCellCenterY = (centerRectY + y + unitCellHeight / 2) - groupAreaHeight / 2
    const rect = twoInstance.value.makeRectangle(unitCellCenterX, unitCellCenterY, unitCellWidth, unitCellHeight)

    rect.fill = 'white'
    rect.linewidth = 1
    rect.stroke = 'black'
    rect.id = `item-${i+1}`

    if (placeBox.value.some(item => item.id === rect.id && item.location === 'placeBox')) {
      rect.fill = 'blue'
    }

    rects.push(rect)
  }

  const group = twoInstance.value.makeGroup(rects)
  group.id = 'group-1'

}

function extractItem() {
  const extractItem = extractBox.value.shift()

  if (extractItem) {
    tempBox.value.push({
      ...extractItem,
      location: 'placeBox'
    })
  }

  drawExtractBox()
}

function placeItem() {
  const placeItem = tempBox.value.shift()

  if (placeItem) {
    placeBox.value.push({
      ...placeItem,
      location: 'placeBox'
    })
  }

  drawPlaceBox()
}

function extractAndPlaceItem() {
  rotateRect('vertical')
  moveRect('vertical')
  rotateRect('horizontal')
  moveRect('horizontal')
}
</script>

<template>
  <main>
    <h2>機械手臂</h2>
    <br>
    <hr>

    <div class="learning-goal-list">
      <h2>學習目標：</h2>

      <p v-for="{goal, checked} in learningGoalList" :key="goal" class="goal-list-item">
        <input type="checkbox" :checked="checked">
        <label>{{goal}}</label>
      </p>
    </div>

    <br>
    <hr>
    <br>

    <h2>操作按鈕</h2>

    <div class="action-buttons">
      <button @click="IS_DEMO_SINGLE_ACTION = !IS_DEMO_SINGLE_ACTION">
        透過此按鈕切換 demo 單一操作或者完整操作
        <br>
        IS_DEMO_SINGLE_ACTION : {{ IS_DEMO_SINGLE_ACTION }}
      </button>
      <button @click="rotateRect('vertical')">垂直轉向</button>
      <button @click="rotateRect('horizontal')">水平轉向</button>
      <button @click="moveRect('vertical')">垂直移動</button>
      <button @click="moveRect('horizontal')">水平移動</button>
      <button @click="extractAndPlaceItem">於提取盒提取物品並放置於放置盒</button>
    </div>
    <br>
    <hr>
    <br>

    <h2>Demo</h2>
    <div class="boxes">
      <p><b class="box-name">Extract box:</b> {{ extractBox }}</p>
      <p><b class="box-name">Temp box:</b> {{ tempBox }}</p>
      <p><b class="box-name">Place box:</b> {{ placeBox }}</p>
    </div>

    <br>
    <br>
    <br>
    <div id="render-container" ref="renderContainer"></div>
  </main>
</template>

<style lang="scss" scoped>
.learning-goal-list {
  margin-top: 20px;
  input {
    margin-right: 10px;
  }
}

.action-buttons {
  button {
    margin: 5px;
  }
}
#render-container {
  outline: 1px solid red;
  height: 500px;
  width: 70%;
  margin: 0 auto;
}

.boxes {
  display: flex;

  p {
    width: 33.33%;
    height: 200px;
    overflow: auto;
  }

  .box-name {
    font-size: 20px;
    color: red;
  }
}


</style>
