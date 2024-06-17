<script setup>
import { ref, onMounted } from 'vue'
import Two from 'two.js'

onMounted(() => {
  initTwoInstance()
})


const learningGoalList = ref([
  {
    goal: '使用 Two.js 繪製一個長方形',
    checked: true
  },
  {
    goal: '設定長方形的旋轉角度（45deg）',
    checked: true
  },
  {
    goal: '設定長方形在頁面中的位置',
    checked: true
  },
  {
    goal: '設定長方形的樣式(background / stroke / lineWidth',
    checked: true
  },
  {
    goal: '繪製一個 5 x 5 的方格',
    checked: true
  },
  {
    goal: '透過資料決定在 5 x 5 方格中，哪些小方格需要變顏色',
    checked: true
  },
  {
    goal: '可以隨機渲染小方格',
    checked: true
  },
  {
    goal: '以動畫方式隨機渲染小方格',
    checked: true
  },
])
const twoInstance = ref(null)
const renderContainer = ref(null)
const shapes = ref([])

function initTwoInstance() {
  const params = {
    type: Two.Types.svg,
    autostart: true,
    fullscreen: false, // When the fullscreen parameter is set to true Two.js automatically makes the position: fixed and does overflow: hidden on the body.
  }
  twoInstance.value = new Two(params).appendTo(renderContainer.value)
}


function resetTwoInstance() {
  twoInstance.value.clear()
  twoInstance.value.update()
}

function addShape(shape) {
  shapes.value.pop()
  shapes.value.push(shape)

  resetTwoInstance()

  shapes.value.forEach(shape => {
    drawShape(shape)
  })
}

function drawShape (shapeConfig) {
  switch (shapeConfig.type) {
    case 'rectangle':
      const { x: rectX, y: rectY, width, height } = shapeConfig || { x: 72, y: 100, width: 100, height: 100 }
      const rect = twoInstance.value.makeRectangle(rectX, rectY, width, height)
      rect.id = 'rectangle-1'
      twoInstance.value.update()
      break
  }
}

function rotateShape({ type, shapeId, degree }) {
  switch (type) {
    case 'rectangle':
      const rect = twoInstance.value.scene.getById(shapeId)
      rect.rotation = degree * Math.PI / 180
      twoInstance.value.update()
      break
  }
}

function setShapePosition({ type, shapeId, x, y }) {
  switch (type) {
    case 'rectangle':
      const rect = twoInstance.value.scene.getById(shapeId)
      rect.translation.set(x, y)
      twoInstance.value.update()
      break
  }
}

function setShapeStyle({ type, shapeId, style }) {
  switch (type) {
    case 'rectangle':
      const rect = twoInstance.value.scene.getById(shapeId)
      rect.fill = style.fill
      rect.linewidth = style.lineWidth
      rect.stroke = style.stroke
      twoInstance.value.update()
      break
  }
}

function addFiveTimesFiveCell() {
  resetTwoInstance()

  const groupAreaWidth = 100
  const groupAreaHeight = 100
  const centerRectX = groupAreaWidth / 2
  const centerRectY = groupAreaHeight / 2

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

    const unitCellCenterX = x + unitCellWidth / 2
    const unitCellCenterY = y + unitCellHeight / 2
    const rect = twoInstance.value.makeRectangle(unitCellCenterX, unitCellCenterY, unitCellWidth, unitCellHeight)

    rect.fill = 'white'
    rect.linewidth = 1
    rect.stroke = 'black'
    rect.id = `rect-${i}`

    rects.push(rect)
  }

  const group = twoInstance.value.makeGroup(rects)
  group.id = 'group-1'

  twoInstance.value.update()
}

function drawCellByRectIds() {
  const group = twoInstance.value.scene.getById('group-1')
  const children = group.children
  const testRectIds = ['rect-1', 'rect-3', 'rect-5', 'rect-7', 'rect-9', 'rect-11']

  children.forEach(child => {
    if (testRectIds.includes(child.id)) {
      child.fill = 'red'
    }
  })

  twoInstance.value.update()
}

function generateRandomRectIds() {
  const rectIds = []
  for (let i = 0; i < 25; i++) {
    const random = Math.random()
    if (random > 0.5) {
      rectIds.push(`rect-${i}`)
    }
  }
  return rectIds
}

function randomColor() {
  return `#${Math.floor(Math.random()*16777215).toString(16)}`
}

function shuffleCellByRandomRectIds() {
  const group = twoInstance.value.scene.getById('group-1')
  const children = group.children
  const randomRectIds = generateRandomRectIds()

  children.forEach(child => {
    child.fill = 'white'
    if (randomRectIds.includes(child.id)) {
      child.fill = randomColor()
    }
  })

  twoInstance.value.update()
}

function animateShuffleCellByRandomRectIds() {
  setInterval(() => {
    shuffleCellByRandomRectIds()
  }, 250)
}
</script>

<template>
  <main>
    <h2>長方形</h2>
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
      <button @click="addShape({
        type: 'rectangle',
        x: 72, y: 100, width: 100, height: 100
      })"
      >
        繪製長方形
      </button>
      <button @click="rotateShape({
        type: 'rectangle',
        shapeId: 'rectangle-1',
        degree: 45
      })">
        旋轉長方形
      </button>
      <button @click="setShapePosition({
        type: 'rectangle',
        shapeId: 'rectangle-1',
        x: 100, y: 100
      })">
        調整長方形在頁面中的位置
      </button>
      <button @click="setShapeStyle({
        type: 'rectangle',
        shapeId: 'rectangle-1',
        style: {
          fill: 'red',
          lineWidth:10,
          stroke: 'yellow'
        }
      })">修改一個長方形背景顏色</button>
      <button @click="addFiveTimesFiveCell">繪製一個 5 x 5 的方格</button>
      <button @click="drawCellByRectIds">透過資料決定在 5 x 5 方格中，哪些小方格需要變顏色</button>
      <button @click="shuffleCellByRandomRectIds">可以隨機渲染小方格</button>
      <button @click="animateShuffleCellByRandomRectIds">以動畫方式隨機渲染小方格</button>
    </div>
    <br>
    <hr>
    <br>

    <h2>Demo</h2>
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
</style>
