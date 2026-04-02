-- CCRAFT Executor GUI Conversion
local Player = game.Players.LocalPlayer
local PlayerGui = Player:WaitForChild("StarterGui")

-- 1. المحاوئ الأساسية (Colors & Theme)
local THEME = {
	BG = Color3.fromRGB(10, 12, 20),
	BG2 = Color3.fromRGB(14, 17, 32),
	BG3 = Color3.fromRGB(20, 24, 40),
	PRIMARY = Color3.fromRGB(139, 92, 246),
	TEXT = Color3.fromRGB(226, 232, 240),
	MUTED = Color3.fromRGB(100, 116, 139),
	GREEN = Color3.fromRGB(74, 222, 128),
	RED = Color3.fromRGB(248, 113, 113),
	BORDER = Color3.fromRGB(139, 92, 246)
}

-- 2. إنشاء الـ ScreenGui
local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "CCRAFT_Executor"
ScreenGui.ResetOnSpawn = false
ScreenGui.Parent = PlayerGui

-- 3. الإطار الرئيسي (Main Frame)
local MainFrame = Instance.new("Frame")
MainFrame.Name = "MainFrame"
MainFrame.Size = UDim2.new(0, 700, 0, 450)
MainFrame.Position = UDim2.new(0.5, -350, 0.5, -225)
MainFrame.BackgroundColor3 = THEME.BG
MainFrame.BorderSizePixel = 0
MainFrame.Parent = ScreenGui

local MainCorner = Instance.new("UICorner")
MainCorner.CornerRadius = UDim.new(0, 12)
MainCorner.Parent = MainFrame

local MainStroke = Instance.new("UIStroke")
MainStroke.Color = THEME.BORDER
MainStroke.Transparency = 0.8
MainStroke.Thickness = 1.5
MainStroke.Parent = MainFrame

-- 4. شريط العنوان (Title Bar)
local TitleBar = Instance.new("Frame")
TitleBar.Name = "TitleBar"
TitleBar.Size = UDim2.new(1, 0, 0, 40)
TitleBar.BackgroundColor3 = THEME.BG2
TitleBar.BorderSizePixel = 0
TitleBar.Parent = MainFrame

local TitleLabel = Instance.new("TextLabel")
TitleLabel.Text = " ⚡ CCRAFT Executor — v2.4.1"
TitleLabel.Size = UDim2.new(1, -50, 1, 0)
TitleLabel.Position = UDim2.new(0, 15, 0, 0)
TitleLabel.BackgroundTransparency = 1
TitleLabel.TextColor3 = THEME.TEXT
TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
TitleLabel.Font = Enum.Font.GothamBold
TitleLabel.TextSize = 14
TitleLabel.Parent = TitleBar

-- 5. المكتبة الجانبية (Sidebar)
local Sidebar = Instance.new("Frame")
Sidebar.Name = "Sidebar"
Sidebar.Size = UDim2.new(0, 180, 1, -40)
Sidebar.Position = UDim2.new(0, 0, 0, 40)
Sidebar.BackgroundColor3 = THEME.BG2
Sidebar.BorderSizePixel = 0
Sidebar.Parent = MainFrame

local LibHeader = Instance.new("TextLabel")
LibHeader.Text = "مكتبة CCRAFT"
LibHeader.Size = UDim2.new(1, 0, 0, 30)
LibHeader.BackgroundTransparency = 1
LibHeader.TextColor3 = THEME.MUTED
LibHeader.Font = Enum.Font.GothamBold
LibHeader.TextSize = 10
LibHeader.Parent = Sidebar

local ScriptList = Instance.new("ScrollingFrame")
ScriptList.Size = UDim2.new(1, -10, 1, -40)
ScriptList.Position = UDim2.new(0, 5, 0, 35)
ScriptList.BackgroundTransparency = 1
ScriptList.ScrollBarThickness = 2
ScriptList.Parent = Sidebar

local ListLayout = Instance.new("UIListLayout")
ListLayout.Padding = UDim.new(0, 5)
ListLayout.Parent = ScriptList

-- 6. منطقة المحرر (Editor Area)
local EditorArea = Instance.new("Frame")
EditorArea.Size = UDim2.new(1, -180, 1, -40)
EditorArea.Position = UDim2.new(0, 180, 0, 40)
EditorArea.BackgroundTransparency = 1
EditorArea.Parent = MainFrame

local CodeInput = Instance.new("TextBox")
CodeInput.Name = "CodeEditor"
CodeInput.Size = UDim2.new(1, -20, 0.6, 0)
CodeInput.Position = UDim2.new(0, 10, 0, 10)
CodeInput.BackgroundColor3 = THEME.BG3
CodeInput.TextColor3 = THEME.TEXT
CodeInput.Text = "-- اكتب سكربت هنا\nprint('Hello CCRAFT')"
CodeInput.Font = Enum.Font.Code
CodeInput.TextSize = 14
CodeInput.ClearTextOnFocus = false
CodeInput.MultiLine = true
CodeInput.TextXAlignment = Enum.TextXAlignment.Left
CodeInput.TextYAlignment = Enum.TextYAlignment.Top
CodeInput.Parent = EditorArea

local CodeCorner = Instance.new("UICorner")
CodeCorner.CornerRadius = UDim.new(0, 8)
CodeCorner.Parent = CodeInput

-- 7. شريط الأدوات (Toolbar)
local Toolbar = Instance.new("Frame")
Toolbar.Size = UDim2.new(1, -20, 0, 40)
Toolbar.Position = UDim2.new(0, 10, 0.6, 15)
Toolbar.BackgroundTransparency = 1
Toolbar.Parent = EditorArea

local RunBtn = Instance.new("TextButton")
RunBtn.Text = "▶ تنفيذ"
RunBtn.Size = UDim2.new(0, 80, 1, 0)
RunBtn.BackgroundColor3 = THEME.PRIMARY
RunBtn.TextColor3 = Color3.new(1, 1, 1)
RunBtn.Font = Enum.Font.GothamBold
RunBtn.Parent = Toolbar

local ClearBtn = Instance.new("TextButton")
ClearBtn.Text = "🗑 مسح"
ClearBtn.Size = UDim2.new(0, 80, 1, 0)
ClearBtn.Position = UDim2.new(0, 90, 0, 0)
ClearBtn.BackgroundColor3 = THEME.BG2
ClearBtn.TextColor3 = THEME.RED
ClearBtn.Font = Enum.Font.GothamBold
ClearBtn.Parent = Toolbar

-- 8. الكونسول (Console Output)
local Console = Instance.new("ScrollingFrame")
Console.Size = UDim2.new(1, -20, 0.3, -30)
Console.Position = UDim2.new(0, 10, 0.6, 65)
Console.BackgroundColor3 = Color3.new(0,0,0)
Console.BackgroundTransparency = 0.5
Console.ScrollBarThickness = 2
Console.Parent = EditorArea

local ConsoleText = Instance.new("TextLabel")
ConsoleText.Text = "[SYSTEM]: CCRAFT Executor Ready..."
ConsoleText.Size = UDim2.new(1, -10, 1, 0)
ConsoleText.Position = UDim2.new(0, 5, 0, 0)
ConsoleText.TextColor3 = THEME.GREEN
ConsoleText.BackgroundTransparency = 1
ConsoleText.Font = Enum.Font.Code
ConsoleText.TextSize = 12
ConsoleText.TextXAlignment = Enum.TextXAlignment.Left
ConsoleText.TextYAlignment = Enum.TextYAlignment.Top
ConsoleText.Parent = Console

-- ==========================================
-- وظائف برمجية بسيطة (Functionality)
-- ==========================================

RunBtn.MouseButton1Click:Connect(function()
	local code = CodeInput.Text
	ConsoleText.Text = ConsoleText.Text .. "\n[RUNNING]: Executing script..."
	
	-- ملاحظة: تنفيذ الكود الفعلي يتطلب 'loadstring' 
	-- وهو متاح فقط في الـ Exploits أو إذا فعلت 'AllowThirdPartySales' (لا ينصح به للأمن)
	local success, err = pcall(function()
		-- في الـ Studio العادي هذا لن ينفذ الكود خارجيا
		print("Attempting to run: " .. code)
	end)
	
	if not success then
		ConsoleText.Text = ConsoleText.Text .. "\n[ERROR]: " .. tostring(err)
	else
		ConsoleText.Text = ConsoleText.Text .. "\n[SUCCESS]: Done."
	end
end)

ClearBtn.MouseButton1Click:Connect(function()
	CodeInput.Text = ""
	ConsoleText.Text = "[SYSTEM]: Editor Cleared."
end)

-- جعل النافذة قابلة للسحب (Draggable)
MainFrame.Active = true
MainFrame.Draggable = true
