-- ╔══════════════════════════════════════════════════════════╗
-- ║          CCRAFT SPACE - Roblox Script Library            ║
-- ║          Version: 2.0 | by CCRAFT SPACE Team             ║
-- ║          https://ccraftspace.github.io                   ║
-- ╚══════════════════════════════════════════════════════════╝

local CCRAFT = {}
CCRAFT.Version = "2.0"
CCRAFT.Website = "https://ccraftspace.github.io"
CCRAFT.API     = "https://ccraft-space-scripts-default-rtdb.firebaseio.com"

-- ══════════════════════════════════
--  SERVICES
-- ══════════════════════════════════
local Players           = game:GetService("Players")
local RunService        = game:GetService("RunService")
local TweenService      = game:GetService("TweenService")
local UserInputService  = game:GetService("UserInputService")
local HttpService       = game:GetService("HttpService")
local CoreGui           = game:GetService("CoreGui")

local LocalPlayer = Players.LocalPlayer
local Mouse       = LocalPlayer:GetMouse()

-- ══════════════════════════════════
--  THEME
-- ══════════════════════════════════
local Theme = {
    -- Backgrounds
    BG_MAIN      = Color3.fromRGB( 7,  8, 15),
    BG_CARD      = Color3.fromRGB(13, 15, 28),
    BG_ELEMENT   = Color3.fromRGB(18, 20, 36),
    BG_HOVER     = Color3.fromRGB(25, 28, 48),

    -- Accents
    VIOLET       = Color3.fromRGB(139,  92, 246),
    CYAN         = Color3.fromRGB(  0, 242, 254),
    PINK         = Color3.fromRGB(244, 114, 182),
    GOLD         = Color3.fromRGB(251, 191,  36),
    GREEN        = Color3.fromRGB( 74, 222, 128),
    RED          = Color3.fromRGB(248, 113, 113),

    -- Text
    TEXT_HI      = Color3.fromRGB(240, 240, 255),
    TEXT_MID     = Color3.fromRGB(120, 120, 160),
    TEXT_LO      = Color3.fromRGB( 60,  60,  88),

    -- Border
    BORDER       = Color3.fromRGB( 30,  32,  52),
    BORDER_GLOW  = Color3.fromRGB( 60,  40, 120),

    -- Transparency
    TRANS_CARD   = 0.08,
    TRANS_BLUR   = 0.15,
}

-- ══════════════════════════════════
--  UTILITIES
-- ══════════════════════════════════
local function Tween(obj, props, t, style, dir)
    t     = t     or 0.2
    style = style or Enum.EasingStyle.Quart
    dir   = dir   or Enum.EasingDirection.Out
    TweenService:Create(obj, TweenInfo.new(t, style, dir), props):Play()
end

local function MakeInstance(class, props, parent)
    local obj = Instance.new(class)
    for k, v in pairs(props) do
        obj[k] = v
    end
    if parent then obj.Parent = parent end
    return obj
end

local function Stroke(obj, color, thickness, trans)
    return MakeInstance("UIStroke", {
        Color       = color or Theme.BORDER_GLOW,
        Thickness   = thickness or 1,
        Transparency= trans or 0.6,
        ApplyStrokeMode = Enum.ApplyStrokeMode.Border,
    }, obj)
end

local function Corner(obj, radius)
    return MakeInstance("UICorner", { CornerRadius = UDim.new(0, radius or 10) }, obj)
end

local function Gradient(obj, c1, c2, rot)
    return MakeInstance("UIGradient", {
        Color    = ColorSequence.new{
            ColorSequenceKeypoint.new(0, c1),
            ColorSequenceKeypoint.new(1, c2),
        },
        Rotation = rot or 135,
    }, obj)
end

-- Draggable
local function MakeDraggable(frame, handle)
    handle = handle or frame
    local dragging, dragStart, startPos = false, nil, nil

    handle.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or
           input.UserInputType == Enum.UserInputType.Touch then
            dragging  = true
            dragStart = input.Position
            startPos  = frame.Position
        end
    end)

    UserInputService.InputChanged:Connect(function(input)
        if dragging and (
            input.UserInputType == Enum.UserInputType.MouseMovement or
            input.UserInputType == Enum.UserInputType.Touch
        ) then
            local delta = input.Position - dragStart
            frame.Position = UDim2.new(
                startPos.X.Scale,
                startPos.X.Offset + delta.X,
                startPos.Y.Scale,
                startPos.Y.Offset + delta.Y
            )
        end
    end)

    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 or
           input.UserInputType == Enum.UserInputType.Touch then
            dragging = false
        end
    end)
end

-- ══════════════════════════════════
--  FETCH SCRIPTS FROM FIREBASE
-- ══════════════════════════════════
local function FetchScripts()
    local ok, result = pcall(function()
        local url = CCRAFT.API .. "/scripts.json?orderBy=\"timestamp\"&limitToLast=50"
        -- استخدام game:HttpGet لضمان التوافق مع أغلب المحاكيات (Executors)
        if type(game.HttpGet) == "function" or type(game.HttpGetAsync) == "function" then
            return game:HttpGet(url)
        else
            return HttpService:GetAsync(url)
        end
    end)

    if not ok then
        warn("[CCRAFT] HTTP error: " .. tostring(result))
        return {}
    end

    local decoded = HttpService:JSONDecode(result)
    local scripts = {}

    if decoded and type(decoded) == "table" then
        for id, data in pairs(decoded) do
            if type(data) == "table" and data.title and data.code then
                table.insert(scripts, {
                    id          = id,
                    title       = data.title       or "بدون عنوان",
                    code        = data.code        or "",
                    category    = data.category    or "—",
                    author      = data.author      or "مجهول",
                    likes       = data.likes       or 0,
                    description = data.description or "",
                    map         = data.map         or "",
                    timestamp   = data.timestamp   or 0,
                })
            end
        end
    end

    -- Sort newest first
    table.sort(scripts, function(a, b) return a.timestamp > b.timestamp end)
    return scripts
end

-- ══════════════════════════════════
--  NOTIFICATION SYSTEM
-- ══════════════════════════════════
local notifCount = 0

local function Notify(title, message, duration, color)
    duration = duration or 3
    color    = color    or Theme.VIOLET
    notifCount = notifCount + 1

    local gui = CoreGui:FindFirstChild("CCRAFTNotifs")
    if not gui then
        gui = MakeInstance("ScreenGui", {
            Name            = "CCRAFTNotifs",
            ResetOnSpawn    = false,
            ZIndexBehavior  = Enum.ZIndexBehavior.Sibling,
        }, CoreGui)
        MakeInstance("UIListLayout", {
            Padding          = UDim.new(0, 8),
            HorizontalAlignment = Enum.HorizontalAlignment.Right,
            VerticalAlignment   = Enum.VerticalAlignment.Bottom,
            SortOrder        = Enum.SortOrder.LayoutOrder,
        }, gui)
        MakeInstance("UIPadding", {
            PaddingBottom = UDim.new(0,16),
            PaddingRight  = UDim.new(0,16),
        }, gui)
    end

    local card = MakeInstance("Frame", {
        Size            = UDim2.new(0, 300, 0, 0),
        BackgroundColor3= Theme.BG_CARD,
        BackgroundTransparency = 0.1,
        AutomaticSize   = Enum.AutomaticSize.Y,
        ClipsDescendants= true,
    }, gui)
    Corner(card, 14)
    Stroke(card, color, 1.5, 0.5)

    -- Left accent bar
    local bar = MakeInstance("Frame", {
        Size            = UDim2.new(0, 3, 1, 0),
        Position        = UDim2.new(0,0,0,0),
        BackgroundColor3= color,
        BorderSizePixel = 0,
    }, card)
    Corner(bar, 3)

    local pad = MakeInstance("Frame", {
        Size            = UDim2.new(1,0,0,0),
        AutomaticSize   = Enum.AutomaticSize.Y,
        BackgroundTransparency = 1,
        Position        = UDim2.new(0,12,0,12),
        Size            = UDim2.new(1,-20,0,0),
    }, card)

    MakeInstance("TextLabel", {
        Text            = title,
        TextColor3      = color,
        Font            = Enum.Font.GothamBold,
        TextSize        = 13,
        TextXAlignment  = Enum.TextXAlignment.Left,
        BackgroundTransparency = 1,
        Size            = UDim2.new(1,0,0,18),
        AutomaticSize   = Enum.AutomaticSize.Y,
    }, pad)

    MakeInstance("TextLabel", {
        Text            = message,
        TextColor3      = Theme.TEXT_MID,
        Font            = Enum.Font.Gotham,
        TextSize        = 12,
        TextXAlignment  = Enum.TextXAlignment.Left,
        TextWrapped     = true,
        BackgroundTransparency = 1,
        Size            = UDim2.new(1,0,0,0),
        AutomaticSize   = Enum.AutomaticSize.Y,
        Position        = UDim2.new(0,0,0,20),
    }, pad)

    MakeInstance("UIPadding", { PaddingBottom = UDim.new(0,12) }, pad)

    -- Animate in
    card.Position = UDim2.new(1,20,1,0)
    Tween(card, { Position = UDim2.new(0,0,0,0) }, 0.35, Enum.EasingStyle.Back)

    task.delay(duration, function()
        Tween(card, { Position = UDim2.new(1,20,0,0) }, 0.25)
        task.wait(0.3)
        card:Destroy()
    end)
end

CCRAFT.Notify = Notify

-- ══════════════════════════════════
--  MAIN GUI
-- ══════════════════════════════════
function CCRAFT.CreateGUI()

    -- Remove existing
    local existing = CoreGui:FindFirstChild("CCRAFTSpace")
    if existing then existing:Destroy() end

    local ScreenGui = MakeInstance("ScreenGui", {
        Name            = "CCRAFTSpace",
        ResetOnSpawn    = false,
        ZIndexBehavior  = Enum.ZIndexBehavior.Sibling,
    }, CoreGui)

    -- ── MAIN WINDOW ──────────────────────
    local Window = MakeInstance("Frame", {
        Name                = "Window",
        Size                = UDim2.new(0, 560, 0, 580),
        Position            = UDim2.new(0.5, -280, 0.5, -290),
        BackgroundColor3    = Theme.BG_MAIN,
        BackgroundTransparency = 0.04,
        ClipsDescendants    = true,
    }, ScreenGui)
    Corner(Window, 16)
    Stroke(Window, Theme.VIOLET, 1.5, 0.65)

    -- Gradient overlay at top
    local topGrad = MakeInstance("Frame", {
        Size             = UDim2.new(1,0,0,200),
        BackgroundTransparency = 0,
        BorderSizePixel  = 0,
        ZIndex           = 0,
    }, Window)
    Gradient(topGrad,
        Color3.fromRGB(20, 12, 48),
        Color3.fromRGB(7,   8, 15), 180)

    -- ── TITLEBAR ─────────────────────────
    local TitleBar = MakeInstance("Frame", {
        Name             = "TitleBar",
        Size             = UDim2.new(1, 0, 0, 50),
        BackgroundColor3 = Theme.BG_CARD,
        BackgroundTransparency = 0.3,
        ZIndex           = 10,
    }, Window)
    Corner(TitleBar, 16)

    -- Fix bottom corners of titlebar
    MakeInstance("Frame", {
        Size             = UDim2.new(1,0,0,16),
        Position         = UDim2.new(0,0,1,-16),
        BackgroundColor3 = Theme.BG_CARD,
        BackgroundTransparency = 0.3,
        BorderSizePixel  = 0,
        ZIndex           = 10,
    }, TitleBar)

    -- Logo icon
    MakeInstance("TextLabel", {
        Text             = "⚡",
        Size             = UDim2.new(0,40,0,40),
        Position         = UDim2.new(0,10,0,5),
        Font             = Enum.Font.GothamBold,
        TextSize         = 22,
        BackgroundTransparency = 1,
        TextColor3       = Theme.VIOLET,
        ZIndex           = 11,
    }, TitleBar)

    local TitleLabel = MakeInstance("TextLabel", {
        Text             = "CCRAFT SPACE",
        Size             = UDim2.new(0,200,0,28),
        Position         = UDim2.new(0,50,0,6),
        Font             = Enum.Font.GothamBold,
        TextSize         = 16,
        TextColor3       = Theme.TEXT_HI,
        TextXAlignment   = Enum.TextXAlignment.Left,
        BackgroundTransparency = 1,
        ZIndex           = 11,
    }, TitleBar)

    -- Gradient title
    Gradient(TitleLabel, Theme.VIOLET, Theme.CYAN, 90)

    MakeInstance("TextLabel", {
        Text             = "v" .. CCRAFT.Version,
        Size             = UDim2.new(0,60,0,16),
        Position         = UDim2.new(0,50,0,30),
        Font             = Enum.Font.Gotham,
        TextSize         = 10,
        TextColor3       = Theme.TEXT_LO,
        TextXAlignment   = Enum.TextXAlignment.Left,
        BackgroundTransparency = 1,
        ZIndex           = 11,
    }, TitleBar)

    -- Close button
    local CloseBtn = MakeInstance("TextButton", {
        Name             = "CloseBtn",
        Text             = "✕",
        Size             = UDim2.new(0,32,0,32),
        Position         = UDim2.new(1,-42,0,9),
        Font             = Enum.Font.GothamBold,
        TextSize         = 14,
        TextColor3       = Theme.TEXT_MID,
        BackgroundColor3 = Color3.fromRGB(248,113,113),
        BackgroundTransparency = 0.8,
        ZIndex           = 100,
        Active           = true,
        Selectable       = true
    }, TitleBar)
    Corner(CloseBtn, 8)


    CloseBtn.MouseEnter:Connect(function()
        Tween(CloseBtn, { BackgroundTransparency=0.3, TextColor3=Color3.fromRGB(255,255,255) }, 0.15)
    end)
    CloseBtn.MouseLeave:Connect(function()
        Tween(CloseBtn, { BackgroundTransparency=0.8, TextColor3=Theme.TEXT_MID }, 0.15)
    end)

    -- Minimize button
    local MinBtn = MakeInstance("TextButton", {
        Text             = "—",
        Size             = UDim2.new(0,32,0,32),
        Position         = UDim2.new(1,-80,0,9),
        Font             = Enum.Font.GothamBold,
        TextSize         = 14,
        TextColor3       = Theme.TEXT_MID,
        BackgroundColor3 = Theme.GOLD,
        BackgroundTransparency = 0.8,
        ZIndex           = 12,
        Active           = true,
        Selectable       = true
    }, TitleBar)
    Corner(MinBtn, 8)

    -- ── SIDEBAR ──────────────────────────
    local Sidebar = MakeInstance("Frame", {
        Name             = "Sidebar",
        Size             = UDim2.new(0, 130, 1, -50),
        Position         = UDim2.new(0, 0, 0, 50),
        BackgroundColor3 = Theme.BG_CARD,
        BackgroundTransparency = 0.5,
        ZIndex           = 5,
    }, Window)

    -- Right border on sidebar
    MakeInstance("Frame", {
        Size             = UDim2.new(0,1,1,0),
        Position         = UDim2.new(1,-1,0,0),
        BackgroundColor3 = Theme.BORDER,
        BorderSizePixel  = 0,
        ZIndex           = 6,
    }, Sidebar)

    local SideList = MakeInstance("UIListLayout", {
        Padding          = UDim.new(0,4),
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
    }, Sidebar)

    MakeInstance("UIPadding", {
        PaddingTop   = UDim.new(0,10),
        PaddingLeft  = UDim.new(0,8),
        PaddingRight = UDim.new(0,8),
    }, Sidebar)

    -- ── CONTENT AREA ─────────────────────
    local ContentArea = MakeInstance("Frame", {
        Name             = "ContentArea",
        Size             = UDim2.new(1,-130,1,-50),
        Position         = UDim2.new(0,130,0,50),
        BackgroundTransparency = 1,
        ClipsDescendants = true,
        ZIndex           = 3,
    }, Window)

    -- ── PAGES (tabs) ─────────────────────
    local pages = {}
    local activeTab = nil

    local function CreatePage(name)
        local page = MakeInstance("ScrollingFrame", {
            Name                  = name,
            Size                  = UDim2.new(1,0,1,0),
            BackgroundTransparency= 1,
            Visible               = false,
            ScrollBarThickness    = 3,
            ScrollBarImageColor3  = Theme.VIOLET,
            CanvasSize            = UDim2.new(0,0,0,0),
            AutomaticCanvasSize   = Enum.AutomaticSize.Y,
            ZIndex                = 4,
        }, ContentArea)

        MakeInstance("UIListLayout", {
            Padding          = UDim.new(0,8),
            HorizontalAlignment = Enum.HorizontalAlignment.Center,
            SortOrder        = Enum.SortOrder.LayoutOrder,
        }, page)

        MakeInstance("UIPadding", {
            PaddingTop    = UDim.new(0,12),
            PaddingBottom = UDim.new(0,12),
            PaddingLeft   = UDim.new(0,12),
            PaddingRight  = UDim.new(0,12),
        }, page)

        pages[name] = page
        return page
    end

    -- ── TAB BUTTON CREATOR ───────────────
    local tabButtons = {}

    local function ActivateTab(pageName)
        activeTab = pageName
        -- إخفاء كل الصفحات
        for pn, page in pairs(pages) do
            if page then page.Visible = false end
        end
        -- إعادة الأزرار لشكلها العادي
        for _, tb in pairs(tabButtons) do
            Tween(tb.btn,  { BackgroundTransparency=0.7 }, 0.2)
            Tween(tb.ic,   { TextColor3=Theme.TEXT_MID  }, 0.2)
            Tween(tb.lb,   { TextColor3=Theme.TEXT_LO   }, 0.2)
            Tween(tb.ind,  { BackgroundTransparency=1   }, 0.2)
        end
        
        -- إظهار الصفحة المطلوبة
        if pages[pageName] then pages[pageName].Visible = true end
        
        -- تفعيل شكل الزر المحدد
        local tb = tabButtons[pageName]
        if tb then
            Tween(tb.btn, { BackgroundTransparency=0.2 }, 0.2)
            Tween(tb.ic,  { TextColor3=Theme.VIOLET    }, 0.2)
            Tween(tb.lb,  { TextColor3=Theme.VIOLET    }, 0.2)
            Tween(tb.ind, { BackgroundTransparency=0 }, 0.2)
        end
    end

    local function CreateTab(icon, label, pageName)
        local btn = MakeInstance("TextButton", {
            Text             = "",
            Size             = UDim2.new(1,0,0,68),
            BackgroundColor3 = Theme.BG_ELEMENT,
            BackgroundTransparency = 0.7,
            ZIndex           = 6,
        }, Sidebar)
        Corner(btn, 10)

        local ic = MakeInstance("TextLabel", {
            Text             = icon,
            Size             = UDim2.new(1,0,0,32),
            Position         = UDim2.new(0,0,0,8),
            Font             = Enum.Font.GothamBold,
            TextSize         = 22,
            TextColor3       = Theme.TEXT_MID,
            BackgroundTransparency = 1,
            ZIndex           = 7,
        }, btn)

        local lb = MakeInstance("TextLabel", {
            Text             = label,
            Size             = UDim2.new(1,0,0,18),
            Position         = UDim2.new(0,0,0,40),
            Font             = Enum.Font.Gotham,
            TextSize         = 10,
            TextColor3       = Theme.TEXT_LO,
            BackgroundTransparency = 1,
            ZIndex           = 7,
        }, btn)

        -- Left accent indicator
        local indicator = MakeInstance("Frame", {
            Size             = UDim2.new(0,3,0,36),
            Position         = UDim2.new(0,-8,0.5,-18),
            BackgroundColor3 = Theme.VIOLET,
            BorderSizePixel  = 0,
            BackgroundTransparency = 1,
            ZIndex           = 8,
        }, btn)
        Corner(indicator, 3)

        btn.MouseEnter:Connect(function()
            if pageName ~= activeTab then
                Tween(btn, { BackgroundTransparency=0.5 }, 0.15)
                Tween(ic,  { TextColor3=Theme.TEXT_HI   }, 0.15)
            end
        end)

        btn.MouseLeave:Connect(function()
            if pageName ~= activeTab then
                Tween(btn, { BackgroundTransparency=0.7 }, 0.15)
                Tween(ic,  { TextColor3=Theme.TEXT_MID  }, 0.15)
                Tween(lb,  { TextColor3=Theme.TEXT_LO   }, 0.15)
            end
        end)

        btn.MouseButton1Click:Connect(function()
            ActivateTab(pageName)
        end)

        tabButtons[pageName] = { btn=btn, ic=ic, lb=lb, ind=indicator }
        return btn
    end

    -- ══════════════════════════════════
    --  SECTION: Scripts List
    -- ══════════════════════════════════
    local function MakeScriptCard(parent, script, idx)
        local card = MakeInstance("Frame", {
            Size             = UDim2.new(1,0,0,90),
            BackgroundColor3 = Theme.BG_CARD,
            BackgroundTransparency = 0.3,
            ZIndex           = 5,
            LayoutOrder      = idx,
        }, parent)
        Corner(card, 12)
        Stroke(card, Theme.BORDER, 1, 0.4)

        -- Category color
        local catColors = {
            game  = Theme.GREEN,
            admin = Theme.RED,
            ai    = Theme.VIOLET,
        }
        local accent = catColors[script.category] or Theme.CYAN

        -- Left bar
        local bar = MakeInstance("Frame", {
            Size             = UDim2.new(0,3,1,-16),
            Position         = UDim2.new(0,0,0,8),
            BackgroundColor3 = accent,
            BorderSizePixel  = 0,
            ZIndex           = 6,
        }, card)
        Corner(bar, 3)

        -- Title
        MakeInstance("TextLabel", {
            Text             = script.title,
            Size             = UDim2.new(1,-100,0,20),
            Position         = UDim2.new(0,14,0,10),
            Font             = Enum.Font.GothamBold,
            TextSize         = 13,
            TextColor3       = Theme.TEXT_HI,
            TextXAlignment   = Enum.TextXAlignment.Left,
            TextTruncate     = Enum.TextTruncate.AtEnd,
            BackgroundTransparency = 1,
            ZIndex           = 6,
        }, card)

        -- Author
        MakeInstance("TextLabel", {
            Text             = "👤 " .. script.author .. "  👍 " .. script.likes,
            Size             = UDim2.new(1,-14,0,16),
            Position         = UDim2.new(0,14,0,32),
            Font             = Enum.Font.Gotham,
            TextSize         = 10,
            TextColor3       = Theme.TEXT_LO,
            TextXAlignment   = Enum.TextXAlignment.Left,
            BackgroundTransparency = 1,
            ZIndex           = 6,
        }, card)

        -- Category badge
        local catBadge = MakeInstance("TextLabel", {
            Text             = script.category ~= "—" and ("📁 " .. script.category) or "—",
            Size             = UDim2.new(0,80,0,18),
            Position         = UDim2.new(0,14,0,52),
            Font             = Enum.Font.GothamBold,
            TextSize         = 10,
            TextColor3       = accent,
            BackgroundColor3 = accent,
            BackgroundTransparency = 0.85,
            ZIndex           = 6,
        }, card)
        Corner(catBadge, 6)

        -- Map badge
        if script.map and script.map ~= "" then
            MakeInstance("TextLabel", {
                Text             = "🗺️ " .. script.map,
                Size             = UDim2.new(0,90,0,18),
                Position         = UDim2.new(0,100,0,52),
                Font             = Enum.Font.GothamBold,
                TextSize         = 10,
                TextColor3       = Theme.CYAN,
                BackgroundColor3 = Theme.CYAN,
                BackgroundTransparency = 0.88,
                ZIndex           = 6,
            }, card)
        end

        -- Execute Button
        local ExecBtn = MakeInstance("TextButton", {
            Text             = "▶ تشغيل",
            Size             = UDim2.new(0,76,0,28),
            Position         = UDim2.new(1,-86,0,30),
            Font             = Enum.Font.GothamBold,
            TextSize         = 11,
            TextColor3       = Color3.fromRGB(255,255,255),
            BackgroundColor3 = accent,
            BackgroundTransparency = 0.15,
            ZIndex           = 7,
        }, card)
        Corner(ExecBtn, 8)

        -- Copy Button
        local CopyBtn = MakeInstance("TextButton", {
            Text             = "📋",
            Size             = UDim2.new(0,28,0,28),
            Position         = UDim2.new(1,-86,0,0),
            Font             = Enum.Font.GothamBold,
            TextSize         = 14,
            TextColor3       = Theme.TEXT_MID,
            BackgroundColor3 = Theme.BG_ELEMENT,
            BackgroundTransparency = 0.3,
            ZIndex           = 7,
        }, card)
        Corner(CopyBtn, 8)

        -- Hover card
        card.MouseEnter:Connect(function()
            Tween(card, { BackgroundTransparency=0.1 }, 0.15)
        end)
        card.MouseLeave:Connect(function()
            Tween(card, { BackgroundTransparency=0.3 }, 0.15)
        end)

        -- Execute
        ExecBtn.MouseButton1Click:Connect(function()
            Tween(ExecBtn, { BackgroundTransparency=0 }, 0.1)
            task.wait(0.1)
            Tween(ExecBtn, { BackgroundTransparency=0.15 }, 0.2)

            local ok, err = pcall(function()
                loadstring(script.code)()
            end)

            if ok then
                Notify("✅ تم التشغيل", script.title, 3, Theme.GREEN)
            else
                Notify("❌ خطأ في التشغيل", tostring(err):sub(1,80), 4, Theme.RED)
            end
        end)

        -- Copy
        CopyBtn.MouseButton1Click:Connect(function()
            setclipboard(script.code)
            Notify("📋 تم النسخ", script.title, 2, Theme.CYAN)
            CopyBtn.Text = "✅"
            task.wait(1.5)
            CopyBtn.Text = "📋"
        end)

        return card
    end

    -- ══════════════════════════════════
    --  BUILD PAGES
    -- ══════════════════════════════════

    -- Page: Home
    local homePage = CreatePage("home")

    -- Banner card
    local bannerCard = MakeInstance("Frame", {
        Size             = UDim2.new(1,0,0,110),
        BackgroundColor3 = Color3.fromRGB(15, 10, 35),
        BackgroundTransparency = 0.1,
        ZIndex           = 5,
    }, homePage)
    Corner(bannerCard, 14)
    Stroke(bannerCard, Theme.VIOLET, 1.5, 0.5)
    Gradient(bannerCard,
        Color3.fromRGB(25, 12, 65),
        Color3.fromRGB( 7,  8, 20), 135)

    MakeInstance("TextLabel", {
        Text             = "⚡ CCRAFT SPACE",
        Size             = UDim2.new(1,-20,0,28),
        Position         = UDim2.new(0,16,0,16),
        Font             = Enum.Font.GothamBold,
        TextSize         = 20,
        TextColor3       = Theme.TEXT_HI,
        TextXAlignment   = Enum.TextXAlignment.Left,
        BackgroundTransparency = 1,
        ZIndex           = 6,
    }, bannerCard)

    local bannerSub = MakeInstance("TextLabel", {
        Text             = "منصة سكربتات Roblox العربية",
        Size             = UDim2.new(1,-20,0,20),
        Position         = UDim2.new(0,16,0,46),
        Font             = Enum.Font.Gotham,
        TextSize         = 12,
        TextColor3       = Theme.TEXT_MID,
        TextXAlignment   = Enum.TextXAlignment.Left,
        BackgroundTransparency = 1,
        ZIndex           = 6,
    }, bannerCard)

    Gradient(bannerSub, Theme.VIOLET, Theme.CYAN, 90)

    MakeInstance("TextLabel", {
        Text             = "v" .. CCRAFT.Version .. " | ccraftspace.github.io",
        Size             = UDim2.new(1,-20,0,16),
        Position         = UDim2.new(0,16,0,70),
        Font             = Enum.Font.GothamMedium,
        TextSize         = 10,
        TextColor3       = Theme.TEXT_LO,
        TextXAlignment   = Enum.TextXAlignment.Left,
        BackgroundTransparency = 1,
        ZIndex           = 6,
    }, bannerCard)

    -- Stats row
    local statsRow = MakeInstance("Frame", {
        Size             = UDim2.new(1,0,0,50),
        BackgroundTransparency = 1,
        ZIndex           = 5,
    }, homePage)

    MakeInstance("UIListLayout", {
        FillDirection    = Enum.FillDirection.Horizontal,
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        Padding          = UDim.new(0,8),
    }, statsRow)

    local statData = {
        { "📜", "السكربتات", "..." },
        { "👤", "اللاعب",    LocalPlayer.Name },
    }

    for _, s in ipairs(statData) do
        local sc = MakeInstance("Frame", {
            Size             = UDim2.new(0,148,1,0),
            BackgroundColor3 = Theme.BG_CARD,
            BackgroundTransparency = 0.4,
            ZIndex           = 6,
        }, statsRow)
        Corner(sc, 10)
        Stroke(sc, Theme.BORDER, 1, 0.5)

        MakeInstance("TextLabel", {
            Text             = s[1] .. " " .. s[2],
            Size             = UDim2.new(1,0,0,20),
            Position         = UDim2.new(0,0,0,5),
            Font             = Enum.Font.Gotham,
            TextSize         = 10,
            TextColor3       = Theme.TEXT_LO,
            BackgroundTransparency = 1,
            ZIndex           = 7,
        }, sc)

        local val = MakeInstance("TextLabel", {
            Text             = s[3],
            Size             = UDim2.new(1,0,0,22),
            Position         = UDim2.new(0,0,0,22),
            Font             = Enum.Font.GothamBold,
            TextSize         = 14,
            TextColor3       = Theme.TEXT_HI,
            BackgroundTransparency = 1,
            ZIndex           = 7,
        }, sc)

        if s[2] == "السكربتات" then
            CCRAFT._scriptCountLabel = val
        end
    end

    -- Page: Scripts
    local scriptsPage = CreatePage("scripts")

    -- Search bar
    local searchFrame = MakeInstance("Frame", {
        Size             = UDim2.new(1,0,0,38),
        BackgroundColor3 = Theme.BG_ELEMENT,
        BackgroundTransparency = 0.3,
        ZIndex           = 5,
    }, scriptsPage)
    Corner(searchFrame, 10)
    Stroke(searchFrame, Theme.BORDER, 1, 0.5)

    local searchIcon = MakeInstance("TextLabel", {
        Text             = "🔍",
        Size             = UDim2.new(0,30,1,0),
        Position         = UDim2.new(0,6,0,0),
        Font             = Enum.Font.Gotham,
        TextSize         = 14,
        BackgroundTransparency = 1,
        ZIndex           = 6,
    }, searchFrame)

    local SearchBox = MakeInstance("TextBox", {
        PlaceholderText  = "ابحث عن سكربت...",
        Text             = "",
        Size             = UDim2.new(1,-46,1,-8),
        Position         = UDim2.new(0,34,0,4),
        Font             = Enum.Font.Gotham,
        TextSize         = 12,
        TextColor3       = Theme.TEXT_HI,
        PlaceholderColor3= Theme.TEXT_LO,
        BackgroundTransparency = 1,
        ClearTextOnFocus = false,
        ZIndex           = 6,
        TextXAlignment   = Enum.TextXAlignment.Right,
    }, searchFrame)

    -- Category filters
    local filterFrame = MakeInstance("Frame", {
        Size             = UDim2.new(1,0,0,28),
        BackgroundTransparency = 1,
        ZIndex           = 5,
    }, scriptsPage)

    MakeInstance("UIListLayout", {
        FillDirection    = Enum.FillDirection.Horizontal,
        HorizontalAlignment = Enum.HorizontalAlignment.Right,
        Padding          = UDim.new(0,5),
    }, filterFrame)

    local categories   = {"الكل", "game", "admin", "ai"}
    local catColors2   = { Theme.TEXT_MID, Theme.GREEN, Theme.RED, Theme.VIOLET }
    local activeFilter = "الكل"
    local filterBtns   = {}

    for i, cat in ipairs(categories) do
        local fb = MakeInstance("TextButton", {
            Text             = cat == "الكل" and "🌟 الكل" or ("📁 " .. cat),
            Size             = UDim2.new(0,0,1,0),
            AutomaticSize    = Enum.AutomaticSize.X,
            Font             = Enum.Font.GothamBold,
            TextSize         = 10,
            TextColor3       = i == 1 and catColors2[i] or Theme.TEXT_LO,
            BackgroundColor3 = catColors2[i],
            BackgroundTransparency = i == 1 and 0.75 or 0.92,
            ZIndex           = 6,
        }, filterFrame)
        Corner(fb, 7)

        MakeInstance("UIPadding", {
            PaddingLeft  = UDim.new(0,8),
            PaddingRight = UDim.new(0,8),
        }, fb)

        filterBtns[cat] = fb
    end

    -- Scripts list container
    local scriptsList = MakeInstance("Frame", {
        Size             = UDim2.new(1,0,0,0),
        AutomaticSize    = Enum.AutomaticSize.Y,
        BackgroundTransparency = 1,
        ZIndex           = 5,
    }, scriptsPage)

    MakeInstance("UIListLayout", {
        Padding          = UDim.new(0,7),
        HorizontalAlignment = Enum.HorizontalAlignment.Center,
        SortOrder        = Enum.SortOrder.LayoutOrder,
    }, scriptsList)

    local loadingLabel = MakeInstance("TextLabel", {
        Text             = "⏳ جارٍ تحميل السكربتات...",
        Size             = UDim2.new(1,0,0,40),
        Font             = Enum.Font.Gotham,
        TextSize         = 12,
        TextColor3       = Theme.TEXT_LO,
        BackgroundTransparency = 1,
        ZIndex           = 6,
    }, scriptsList)

    -- Page: Settings
    local settingsPage = CreatePage("settings")

    MakeInstance("TextLabel", {
        Text             = "⚙️ الإعدادات",
        Size             = UDim2.new(1,0,0,28),
        Font             = Enum.Font.GothamBold,
        TextSize         = 16,
        TextColor3       = Theme.TEXT_HI,
        TextXAlignment   = Enum.TextXAlignment.Right,
        BackgroundTransparency = 1,
        ZIndex           = 5,
    }, settingsPage)

    local settingsItems = {
        { "🔔", "الإشعارات",    "تفعيل إشعارات التشغيل"   },
        { "🛡️", "الحماية",      "تحقق من الكود قبل التشغيل" },
        { "🌐", "الموقع",       "ccraftspace.github.io"     },
        { "⚡", "الإصدار",      "v" .. CCRAFT.Version       },
    }

    for _, item in ipairs(settingsItems) do
        local sc = MakeInstance("Frame", {
            Size             = UDim2.new(1,0,0,52),
            BackgroundColor3 = Theme.BG_CARD,
            BackgroundTransparency = 0.4,
            ZIndex           = 5,
        }, settingsPage)
        Corner(sc, 12)
        Stroke(sc, Theme.BORDER, 1, 0.5)

        MakeInstance("TextLabel", {
            Text             = item[1] .. "  " .. item[2],
            Size             = UDim2.new(0.6,0,0,20),
            Position         = UDim2.new(0,14,0,8),
            Font             = Enum.Font.GothamBold,
            TextSize         = 12,
            TextColor3       = Theme.TEXT_HI,
            TextXAlignment   = Enum.TextXAlignment.Right,
            BackgroundTransparency = 1,
            ZIndex           = 6,
        }, sc)

        MakeInstance("TextLabel", {
            Text             = item[3],
            Size             = UDim2.new(0.6,0,0,16),
            Position         = UDim2.new(0,14,0,28),
            Font             = Enum.Font.Gotham,
            TextSize         = 10,
            TextColor3       = Theme.TEXT_LO,
            TextXAlignment   = Enum.TextXAlignment.Right,
            BackgroundTransparency = 1,
            ZIndex           = 6,
        }, sc)
    end

    -- ══════════════════════════════════
    --  BUILD TABS
    -- ══════════════════════════════════
    CreateTab("🏠", "الرئيسية", "home")
    CreateTab("📜", "السكربتات","scripts")
    CreateTab("⚙️", "الإعدادات","settings")

    -- حل مشكلة SimulateClick واستخدام الدالة الآمنة
    task.wait(0.1)
    ActivateTab("home")

    -- ══════════════════════════════════
    --  LOAD SCRIPTS FROM API
    -- ══════════════════════════════════
    local allScripts    = {}
    local currentFilter2 = "الكل"
    local searchQuery   = ""

    local function RenderScripts()
        -- Clear
        for _, c in ipairs(scriptsList:GetChildren()) do
            if c:IsA("Frame") then c:Destroy() end
        end

        local filtered = {}
        for _, s in ipairs(allScripts) do
            local matchCat = (currentFilter2 == "الكل") or (s.category == currentFilter2)
            local matchSearch = searchQuery == "" or
                s.title:lower():find(searchQuery:lower()) or
                (s.map and s.map:lower():find(searchQuery:lower())) or
                (s.author:lower():find(searchQuery:lower()))

            if matchCat and matchSearch then
                table.insert(filtered, s)
            end
        end

        if #filtered == 0 then
            loadingLabel.Text    = "🔍 لا توجد نتائج"
            loadingLabel.Visible = true
        else
            loadingLabel.Visible = false
            for i, s in ipairs(filtered) do
                MakeScriptCard(scriptsList, s, i)
                task.wait()
            end
        end
    end

    task.spawn(function()
        task.wait(0.5)
        Notify("⚡ CCRAFT SPACE", "جارٍ تحميل السكربتات...", 2, Theme.VIOLET)
        allScripts = FetchScripts()

        if #allScripts > 0 then
            loadingLabel.Visible = false
            if CCRAFT._scriptCountLabel then
                CCRAFT._scriptCountLabel.Text = tostring(#allScripts)
            end
            Notify("✅ تم التحميل", "تم تحميل " .. #allScripts .. " سكربت", 3, Theme.GREEN)
            RenderScripts()
        else
            loadingLabel.Text = "❌ تعذّر تحميل السكربتات\nتأكد من تفعيل HTTP في اللعبة"
            Notify("❌ خطأ", "تعذّر الاتصال بالخادم", 3, Theme.RED)
        end
    end)

    -- Search
    SearchBox:GetPropertyChangedSignal("Text"):Connect(function()
        searchQuery = SearchBox.Text
        RenderScripts()
    end)

    -- Filter buttons
    for _, cat in ipairs(categories) do
        filterBtns[cat].MouseButton1Click:Connect(function()
            currentFilter2 = cat
            for _, c2 in ipairs(categories) do
                local idx = table.find(categories, c2)
                Tween(filterBtns[c2], {
                    BackgroundTransparency = c2==cat and 0.75 or 0.92,
                    TextColor3 = c2==cat and catColors2[idx] or Theme.TEXT_LO,
                }, 0.15)
            end
            RenderScripts()
        end)
    end

    -- ══════════════════════════════════
    --  CLOSE / MINIMIZE
    -- ══════════════════════════════════
    local minimized = false

    CloseBtn.MouseButton1Click:Connect(function()
        local closeTween = TweenService:Create(Window, TweenInfo.new(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.In), {
            Size = UDim2.new(0, 0, 0, 0),
            Position = UDim2.new(0.5, 0, 0.5, 0),
            BackgroundTransparency = 1
        })
        
        closeTween:Play()
        closeTween.Completed:Connect(function()
            ScreenGui:Destroy()
        end)
    end)

    MinBtn.MouseButton1Click:Connect(function()
        minimized = not minimized
        if minimized then
            Tween(Window, { Size = UDim2.new(0, 560, 0, 50) }, 0.25, Enum.EasingStyle.Quart)
            MinBtn.Text = "□"
            ContentArea.Visible = false
            Sidebar.Visible = false
        else
            Tween(Window, { Size = UDim2.new(0, 560, 0, 580) }, 0.3, Enum.EasingStyle.Back)
            MinBtn.Text = "—"
            task.wait(0.2)
            ContentArea.Visible = true
            Sidebar.Visible = true
        end
    end)

    -- ══════════════════════════════════
    --  DRAGGABLE
    -- ══════════════════════════════════
    MakeDraggable(Window, TitleBar)

    -- ════════
