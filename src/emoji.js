import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import emojiIcon from '../theme/icons/emoji.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import EmojiListView from './ui/emojilistview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

export default class Emoji extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Emoji';
	}

	init() {
		const editor = this.editor;

		editor.editing.view.addObserver( ClickObserver );

		editor.config.define( 'emojiSmileyIcon', emojiIcon );

		editor.config.define( 'emoji', [
			{ name: 'smile', text: '😀' },
			{ name: 'wink', text: '😉' },
			{ name: 'cool', text: '😎' },
			{ name: 'surprise', text: '😮' },
			{ name: 'confusion', text: '😕' },
			{ name: 'crying', text: '😢' },
			{ name: 'smile', text: '😡' }
		] );

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		/**
		 * The form view displayed inside the balloon.
		 *
		 * @member {module:emoji/ui/emojilistview~EmojiListView}
		 */
		this.formView = this._createForm();

		editor.ui.componentFactory.add( 'emoji', locale => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = editor.t( 'Emoji' );
			button.icon = editor.config.get( 'emojiSmileyIcon' );
			button.tooltip = true;

			// Show the panel on button click.
			this.listenTo( button, 'execute', () => this._showPanel( true ) );

			this._button = button;

			return button;
		} );

		this._attachActions();
	}

	/**
	 * Creates the {@link module:emoji/ui/emojilistview~EmojiListView} instance.
	 *
	 * @private
	 * @returns {module:emoji/ui/emojilistview~EmojiListView} The emoji list view instance.
	 */
	_createForm() {
		const editor = this.editor;
		const emojiView = new EmojiListView( editor );

		editor.config.get( 'emoji' ).forEach( emoji => {
			this.listenTo( emojiView, 'emoji:' + emoji.name, () => {
				editor.model.change( writer => {
					writer.insertText(
						emoji.text,
						editor.model.document.selection.getFirstPosition()
					);
					this._hidePanel();
				} );
			} );
		} );

		// Close the panel on esc key press when the form has focus.
		emojiView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hidePanel( true );
			cancel();
		} );

		return emojiView;
	}

	/**
	 * Adds the {@link #formView} to the {@link #_balloon}.
	 */
	_showPanel() {
		const target = this._button.element;
		this._balloon.add( {
			withArrow: false,
			view: this.formView,
			balloonClassName: 'emoji-balloon-panel',
			position: {
				target,
				limiter: target
			}
		} );
	}

	/**
	 * Attaches actions that control whether the balloon panel containing the
	 * {@link #formView} is visible or not.
	 *
	 * @private
	 */
	_attachActions() {
		// Focus the form if the balloon is visible and the Tab key has been pressed.
		this.editor.keystrokes.set(
			'Tab',
			( data, cancel ) => {
				if (
					this._balloon.visibleView === this.formView &&
					!this.formView.focusTracker.isFocused
				) {
					this.formView.focus();
					cancel();
				}
			},
			{
				// Use the high priority because the emoji UI navigation is more important
				// than other feature's actions, e.g. list indentation.
				// https://github.com/ckeditor/ckeditor5-link/issues/146
				priority: 'high'
			}
		);

		// Close the panel on the Esc key press when the editable has focus and the balloon is visible.
		this.editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			if ( this._balloon.visibleView === this.formView ) {
				this._hidePanel();
				cancel();
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.formView,
			activator: () => this._balloon.hasView( this.formView ),
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hidePanel()
		} );
	}

	/**
	 * Removes the {@link #formView} from the {@link #_balloon}.
	 *
	 * See {@link #_showPanel}.
	 *
	 * @protected
	 * @param {Boolean} [focusEditable=false] When `true`, editable focus will be restored on panel hide.
	 */
	_hidePanel( focusEditable ) {
		this.stopListening( this.editor.editing.view, 'render' );

		if ( !this._balloon.hasView( this.formView ) ) {
			return;
		}

		if ( focusEditable ) {
			this.editor.editing.view.focus();
		}

		this.stopListening( this.editor.editing.view, 'render' );
		this._balloon.remove( this.formView );
	}
}
