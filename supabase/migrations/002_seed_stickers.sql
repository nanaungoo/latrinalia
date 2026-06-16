-- Latrinalia: Seed stickers for demo walls
-- Run after 001_create_tables.sql

INSERT OR IGNORE INTO stickers (id, toilet_id, text_content, font_style, color, x_position, y_position, angle) VALUES
    ('a0000001-0000-4000-8000-000000000001', 'stall-1', 'why are you reading this?', 'scratched', '#333333', 15, 20, -5),
    ('a0000001-0000-4000-8000-000000000002', 'stall-1', 'for a good time call... nobody', 'cursive', '#cc0000', 40, 35, 10),
    ('a0000001-0000-4000-8000-000000000003', 'stall-1', 'I was here. You were too. We are all here.', 'stencil', '#0066cc', 25, 60, 0),
    ('a0000001-0000-4000-8000-000000000004', 'stall-1', 'FREE HUGS (while seated)', 'marker', '#ff6600', 55, 15, -15),
    ('a0000001-0000-4000-8000-000000000005', 'stall-1', 'the void stares back', 'scratched', '#666666', 10, 75, 3),
    ('a0000001-0000-4000-8000-000000000006', 'stall-1', 'KILROY WAS HERE', 'stencil', '#000000', 70, 50, 0),
    ('a0000001-0000-4000-8000-000000000007', 'stall-1', 'poetry is just words that forgot their job', 'cursive', '#993399', 30, 45, 8),
    ('a0000001-0000-4000-8000-000000000008', 'stall-1', '→ the exit is that way', 'marker', '#339933', 80, 80, -3),
    ('a0000001-0000-4000-8000-000000000009', 'stall-1', 'read a book lately? me neither', 'marker', '#0000cc', 20, 90, -7),
    ('a0000001-0000-4000-8000-00000000000a', 'stall-1', 'This wall has seen things.', 'scratched', '#555555', 50, 70, 0),

    ('a0000001-0000-4000-8000-00000000000b', 'stall-2', 'my boss is in the next stall', 'scratched', '#990000', 10, 10, -10),
    ('a0000001-0000-4000-8000-00000000000c', 'stall-2', 'Bartender pours heavy. No complaints.', 'cursive', '#006633', 35, 30, 5),
    ('a0000001-0000-4000-8000-00000000000d', 'stall-2', 'Game of Thrones season 8 was fine fight me', 'marker', '#000000', 60, 20, 0),
    ('a0000001-0000-4000-8000-00000000000e', 'stall-2', '☮ peace was never an option', 'stencil', '#ff00ff', 15, 55, 12),
    ('a0000001-0000-4000-8000-00000000000f', 'stall-2', 'down with the bourgeoisie', 'marker', '#cc0000', 45, 65, -5),
    ('a0000001-0000-4000-8000-000000000010', 'stall-2', 'i like turtles', 'scratched', '#339933', 75, 40, 0),
    ('a0000001-0000-4000-8000-000000000011', 'stall-2', '1-800-JENNY — she gives terrible advice', 'marker', '#0000ff', 30, 80, 8),

    ('a0000001-0000-4000-8000-000000000012', 'stall-3', 'clean me', 'scratched', '#888888', 50, 50, 0),
    ('a0000001-0000-4000-8000-000000000013', 'stall-3', 'No, you clean ME first', 'marker', '#000000', 52, 55, 0),
    ('a0000001-0000-4000-8000-000000000014', 'stall-3', 'BEANS', 'stencil', '#cc6600', 25, 20, 15),
    ('a0000001-0000-4000-8000-000000000015', 'stall-3', 'if lost, return to the bar', 'cursive', '#006699', 70, 25, -8);
